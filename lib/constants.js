// Shared, client-safe constants: palettes, navigation, AI features.

export const PALETTES = [
  {
    id: 'midnight',
    name: 'Midnight Love',
    swatch: ['#6d5dfc', '#c354ff', '#0b1026'],
  },
  {
    id: 'pink',
    name: 'Soft Pink',
    swatch: ['#ff7eb3', '#ff9a8b', '#fff0f5'],
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    swatch: ['#a78bfa', '#c4b5fd', '#f5f3ff'],
  },
  {
    id: 'sunset',
    name: 'Sunset Romance',
    swatch: ['#ff6a88', '#ff9a44', '#fff4e6'],
  },
];

export const PALETTE_IDS = PALETTES.map((p) => p.id);

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: 'Home' },
  { href: '/chat', label: 'Chat', icon: 'MessageCircle' },
  { href: '/gallery', label: 'Gallery', icon: 'Images' },
  { href: '/dates', label: 'Dates', icon: 'CalendarHeart' },
  { href: '/ai', label: 'Copilot', icon: 'Sparkles' },
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
