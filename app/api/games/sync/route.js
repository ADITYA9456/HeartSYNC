import { z } from 'zod';
import { withCouple, json, error, parseBody } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Per-partner answers for the sync games. Stored in the existing game_sessions
// table with status 'sync', so the Couple Quiz ('active') is never affected.
//
// Visibility is decided here, on the server. A field that is still hidden from
// the viewer is never included in the response, so it cannot be read from the
// network tab (this is what makes Letter Lock actually locked).
//   public: fields of the partner's entry that are always visible, or '*'.
//   Everything else is shown only once the viewer has submitted their own entry.
const GAMES = {
  'would-you-rather': { public: [], asymmetric: false },
  'never-have-i-ever': { public: [], asymmetric: false },
  'watch-and-answer': { public: [], asymmetric: false },
  'two-truths-and-a-lie': { public: ['statements'], asymmetric: true },
  'how-well-do-you-know-me': { public: ['prompts'], asymmetric: true },
  'song-story': { public: '*', asymmetric: true },
  'letter-lock': { public: [], asymmetric: true },
};

const GAME_IDS = Object.keys(GAMES);
const MAX_PAYLOAD_BYTES = 4000;

const submitSchema = z.object({
  game: z.enum(GAME_IDS),
  action: z.enum(['submit', 'new']).default('submit'),
  roundKey: z.string().trim().max(20).optional(),
  data: z
    .record(z.union([z.string().max(500), z.number(), z.boolean(), z.array(z.union([z.string().max(500), z.number()])).max(10)]))
    .optional(),
});

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

async function loadSession(coupleId, game) {
  const { data, error: e } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('game_type', game)
    .eq('status', 'sync')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { session: data || null, failed: !!e };
}

function normalise(session) {
  const state = session?.state || {};
  return {
    round: Number.isInteger(state.round) ? state.round : 1,
    roundKey: typeof state.roundKey === 'string' ? state.roundKey : null,
    entries: state.entries && typeof state.entries === 'object' ? state.entries : {},
  };
}

function view(game, state, userId) {
  const cfg = GAMES[game];
  const mine = state.entries[userId] || null;
  const otherId = Object.keys(state.entries).find((id) => id !== userId);
  const other = otherId ? state.entries[otherId] : null;

  let otherView = null;
  if (other) {
    const visibleAll = !!mine || cfg.public === '*';
    if (visibleAll) {
      otherView = { role: other.role, data: other.data, at: other.at };
    } else {
      const data = {};
      for (const key of cfg.public) if (key in other.data) data[key] = other.data[key];
      otherView = { role: other.role, data, sealed: true, at: other.at };
    }
  }
  return {
    game,
    round: state.round,
    roundKey: state.roundKey,
    mine,
    other: otherView,
    otherSubmitted: !!other,
  };
}

export const GET = withCouple(async ({ req, user, couple }) => {
  const params = new URL(req.url).searchParams;
  const game = params.get('game');
  const roundKey = (params.get('roundKey') || '').slice(0, 20);
  if (!GAME_IDS.includes(game)) return error('Unknown game', 400);
  const { session, failed } = await loadSession(couple.id, game);
  if (failed) return error('Could not load game', 500);
  let state = normalise(session);
  // A new weekly key reads as an empty round; it is saved on the first answer.
  if (roundKey && state.roundKey !== roundKey) {
    state = { round: state.round + 1, roundKey, entries: {} };
  }
  const res = json(view(game, state, user.id));
  res.headers.set('Cache-Control', 'no-store');
  return res;
});

export const PUT = withCouple(async ({ req, user, members, couple }) => {
  const body = await parseBody(req, submitSchema);
  const cfg = GAMES[body.game];
  if (!members.some((m) => m.user_id !== user.id)) return error('A partner is required to play', 400);

  const { session, failed } = await loadSession(couple.id, body.game);
  if (failed) return error('Could not load game', 500);
  let state = normalise(session);

  // A different weekly/round key starts a fresh round for both partners.
  if (body.roundKey && state.roundKey !== body.roundKey) {
    state = { round: state.round + 1, roundKey: body.roundKey, entries: {} };
  }

  if (body.action === 'new') {
    if (!state.entries[user.id]) return error('Finish this round first', 409);
    state = { round: state.round + 1, roundKey: state.roundKey, entries: {} };
  } else {
    if (!body.data) return error('Answer is required', 400);
    if (JSON.stringify(body.data).length > MAX_PAYLOAD_BYTES) return error('Answer is too long', 400);
    if (body.game === 'song-story' && body.data.link && !isHttpUrl(String(body.data.link))) {
      return error('Use a link that starts with http or https', 400);
    }
    if (state.entries[user.id]) return error('You already answered this round', 409);
    const hasOther = Object.keys(state.entries).length > 0;
    const role = !cfg.asymmetric ? 'player' : hasOther ? 'reply' : 'author';
    state = {
      ...state,
      entries: { ...state.entries, [user.id]: { role, data: body.data, at: new Date().toISOString() } },
    };
  }

  const complete = Object.keys(state.entries).length >= 2;
  let saved;
  if (session) {
    const { data, error: e } = await supabase
      .from('game_sessions')
      .update({ state })
      .eq('id', session.id)
      .eq('couple_id', couple.id)
      .select('*')
      .single();
    if (e) return error('Could not save answer', 500);
    saved = data;
  } else {
    const { data, error: e } = await supabase
      .from('game_sessions')
      .insert({
        couple_id: couple.id,
        created_by: user.id,
        game_type: body.game,
        status: 'sync',
        current_turn_user_id: null,
        state,
      })
      .select('*')
      .single();
    if (e) return error('Could not save answer', 500);
    saved = data;
  }
  const res = json({ ...view(body.game, normalise(saved), user.id), complete });
  res.headers.set('Cache-Control', 'no-store');
  return res;
});
