import { withCouple, json, error, parseBody } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { createGameSchema, answerGameSchema } from '@/lib/validators';
import { COUPLE_QUIZ_QUESTIONS } from '@/lib/games';

function decorate(session) {
  if (!session) return null;
  const state = session.state || {};
  return {
    ...session,
    state: {
      questionIndex: Number.isInteger(state.questionIndex) ? state.questionIndex : 0,
      answers: Array.isArray(state.answers) ? state.answers : [],
      scores: state.scores || {},
    },
    questionCount: COUPLE_QUIZ_QUESTIONS.length,
    question:
      session.game_type === 'couple_quiz'
        ? COUPLE_QUIZ_QUESTIONS[state.questionIndex || 0] || null
        : null,
  };
}

export const GET = withCouple(async ({ couple }) => {
  const [{ data: active, error: activeError }, { data: history, error: historyError }] =
    await Promise.all([
      supabase
        .from('game_sessions')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('game_sessions')
        .select('id, game_type, status, state, created_at, updated_at')
        .eq('couple_id', couple.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);
  if (activeError || historyError) return error('Could not load games', 500);
  return json({ active: decorate(active), history: (history || []).map(decorate) });
});

export const POST = withCouple(async ({ req, user, members, couple }) => {
  const body = await parseBody(req, createGameSchema);
  const opponent = members.find((member) => member.user_id !== user.id);
  if (!opponent) return error('A partner is required to start a game', 400);

  const { data: existing } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('couple_id', couple.id)
    .eq('status', 'active')
    .maybeSingle();
  if (existing) return json({ game: decorate(existing) });

  const { data, error: e } = await supabase
    .from('game_sessions')
    .insert({
      couple_id: couple.id,
      created_by: user.id,
      game_type: body.gameType,
      current_turn_user_id: user.id,
      state: { questionIndex: 0, answers: [], scores: { [user.id]: 0, [opponent.user_id]: 0 } },
    })
    .select('*')
    .single();
  if (e) return error('Could not start game', 500);
  return json({ game: decorate(data) }, 201);
});

export const PATCH = withCouple(async ({ req, user, members, couple }) => {
  const body = await parseBody(req, answerGameSchema);
  const { data: session, error: loadError } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', body.gameId || '')
    .eq('couple_id', couple.id)
    .eq('status', 'active')
    .maybeSingle();
  if (loadError || !session) return error('Active game not found', 404);
  if (session.current_turn_user_id !== user.id) return error('It is your partner’s turn', 409);

  const state = session.state || {};
  const questionIndex = Number.isInteger(state.questionIndex) ? state.questionIndex : 0;
  const answers = Array.isArray(state.answers) ? state.answers : [];
  const scores = { ...(state.scores || {}) };
  const questionAnswers = answers.filter((answer) => answer.questionIndex === questionIndex);
  if (questionAnswers.some((answer) => answer.userId === user.id)) {
    return error('You already answered this question', 409);
  }
  answers.push({ userId: user.id, questionIndex, answer: body.answer, createdAt: new Date().toISOString() });
  scores[user.id] = (scores[user.id] || 0) + 1;
  const partner = members.find((member) => member.user_id !== user.id);
  const previousAnswerer = questionAnswers[0]?.userId;
  const complete = questionIndex >= COUPLE_QUIZ_QUESTIONS.length - 1 && !!previousAnswerer;
  const nextTurn = complete ? null : previousAnswerer || partner?.user_id || null;
  const nextState = {
    questionIndex: complete ? questionIndex : questionIndex + (opponent ? 1 : 0),
    answers,
    scores,
  };
  const { data, error: updateError } = await supabase
    .from('game_sessions')
    .update({
      state: nextState,
      status: complete ? 'completed' : 'active',
      current_turn_user_id: nextTurn,
    })
    .eq('id', session.id)
    .eq('couple_id', couple.id)
    .select('*')
    .single();
  if (updateError) return error('Could not save answer', 500);
  return json({ game: decorate(data) });
});
