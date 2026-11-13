// Shared, client-safe constants: palettes, navigation, AI features.

// Accent palettes. IDs are persisted (couples.theme, localStorage) so they
// never change; names/colours are the redesigned accents (see globals.css).
// accent = [light, dark]
export const PALETTES = [
  { id: 'pink', name: 'Rose', accent: ['#b0264f', '#f27b97'] },
  { id: 'midnight', name: 'Ink', accent: ['#2f4b8f', '#93aeee'] },
  { id: 'lavender', name: 'Plum', accent: ['#7a3e8c', '#cfa0dd'] },
  { id: 'sunset', name: 'Terracotta', accent: ['#a3431d', '#f0956c'] },
];

export const PALETTE_IDS = PALETTES.map((p) => p.id);

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: 'Home' },
  { href: '/chat', label: 'Chat', icon: 'MessageCircle' },
  { href: '/gallery', label: 'Gallery', icon: 'Images' },
  { href: '/dates', label: 'Dates', icon: 'CalendarHeart' },
  { href: '/games', label: 'Games', icon: 'Gamepad2' },
  { href: '/productivity', label: 'Tasks', icon: 'ListTodo' },
  { href: '/ai', label: 'Copilot', icon: 'CopilotMark' },
];

// Bottom nav: the four most-used destinations (daily: Home, Chat; several
// times a week: Gallery, Dates). Everything else lives in the "More" sheet.
export const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Home', icon: 'House' },
  { href: '/chat', label: 'Chat', icon: 'MessageCircle' },
  { href: '/gallery', label: 'Gallery', icon: 'Images' },
  { href: '/dates', label: 'Dates', icon: 'CalendarHeart' },
];

export const MORE_NAV = [
  { href: '/games', label: 'Games', icon: 'Gamepad2', blurb: 'Couple Quiz and 12 games to play together' },
  { href: '/productivity', label: 'Tasks', icon: 'ListTodo', blurb: 'Shared to-dos and plans' },
  { href: '/ai', label: 'Copilot', icon: 'CopilotMark', blurb: 'Date ideas, notes and gift ideas' },
  { href: '/music', label: 'Music', icon: 'Music', blurb: 'Your YouTube playlists' },
  { href: '/period', label: 'Wellness', icon: 'HeartPulse', blurb: 'Private cycle and mood tracker' },
  { href: '/settings', label: 'Settings', icon: 'Settings', blurb: 'Profile, theme, anniversary, timezone' },
];

export const AI_FEATURES = [
  {
    id: 'date_idea',
    label: 'Date Ideas',
    icon: 'CalendarHeart',
    placeholder: 'a cozy rainy-day date at home, low budget',
    blurb: 'Fresh, personalized date plans.',
  },
  {
    id: 'caption',
    label: 'Captions',
    icon: 'Quote',
    placeholder: 'a photo of us watching the sunset at the beach',
    blurb: 'Captions for your shared memories.',
  },
  {
    id: 'love_note',
    label: 'Love Notes',
    icon: 'Heart',
    placeholder: 'tell them I am proud of how hard they worked this week',
    blurb: 'Heartfelt notes, your words polished.',
  },
  {
    id: 'apology',
    label: 'Apologies',
    icon: 'HeartHandshake',
    placeholder: 'I forgot our plans last night and they felt hurt',
    blurb: 'Sincere, accountable apologies.',
  },
  {
    id: 'gift_idea',
    label: 'Gift Ideas',
    icon: 'Gift',
    placeholder: 'they love hiking, coffee, and sci-fi books; budget $50',
    blurb: 'Thoughtful gift suggestions.',
  },
];

export const REACTION_EMOJIS = ['❤️', '😂', '😍', '🥺', '🔥', '👍'];

export const PING_TYPES = {
  hug: { type: 'hug', emoji: '🤗', title: 'Sent you a hug' },
  miss_you: { type: 'miss_you', emoji: '🥺', title: 'Misses you' },
};
