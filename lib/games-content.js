// Content for the local (on-device) couple games. Everything here is plain
// frontend data: no DB tables, nothing is sent to the server. Keep it flirty,
// warm and tasteful.

export const GAMES = [
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    icon: 'Drama',
    rule: 'Take turns picking a truth or a dare. One pass per round.',
    howTo: [
      'Choose Mild or Spicy before you start.',
      'On your turn, pick Truth or Dare and read the card out loud.',
      'Do it, or use your one pass for that round to draw a new card.',
      'After 10 turns you will see who completed the most cards.',
    ],
    players: 'Pass the phone',
    minutes: 15,
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    icon: 'Scale',
    rule: 'Both of you pick A or B in secret, then reveal your matches.',
    howTo: [
      'The first partner picks A or B without showing the screen.',
      'Pass the phone. The second partner picks too.',
      'Reveal to see if you matched. Talk about the ones you did not.',
    ],
    players: 'Pass the phone',
    minutes: 10,
  },
  {
    id: 'never-have-i-ever',
    title: 'Never Have I Ever',
    icon: 'Hand',
    rule: 'Answer in secret, then tap to reveal how many of you have.',
    howTo: [
      'Each of you privately taps "I have" or "I never have".',
      'Tap reveal to see the count, not who said what.',
      'The story behind a "2" is usually the best part.',
    ],
    players: 'Pass the phone',
    minutes: 10,
  },
  {
    id: 'two-truths-one-lie',
    title: 'Two Truths and a Lie',
    icon: 'ShieldQuestion',
    rule: 'Write three statements, mark the lie, and let your partner guess.',
    howTo: [
      'Partner one writes three statements and secretly marks the lie.',
      'Partner two guesses which one is the lie.',
      'Swap roles. A correct guess scores a point.',
    ],
    players: 'Pass the phone',
    minutes: 10,
  },
  {
    id: 'how-well-do-you-know-me',
    title: 'How Well Do You Know Me',
    icon: 'ScanSearch',
    rule: 'One of you answers about yourself, the other guesses.',
    howTo: [
      'Pick who is answering about themselves.',
      'They type their real answer, then pass the phone.',
      'The guesser types a guess. The answerer decides if it counts.',
      'Six questions, one score at the end.',
    ],
    players: 'Pass the phone',
    minutes: 10,
  },
  {
    id: 'rapid-fire',
    title: 'Rapid Fire',
    icon: 'Timer',
    rule: 'Sixty seconds. Answer as many quick questions as you can.',
    howTo: [
      'Pick who is answering. The other reads the questions out loud.',
      'Tap Answered for every reply, or Skip to move on.',
      'When the timer hits zero you see the count.',
    ],
    players: 'One answers, one reads',
    minutes: 2,
  },
  {
    id: 'hot-seat',
    title: 'Hot Seat',
    icon: 'Armchair',
    rule: 'One of you sits in the hot seat. The other asks the deep questions.',
    howTo: [
      'Pick who takes the hot seat.',
      'The asker reads each question and listens without interrupting.',
      'Skip anything that does not feel right today. End whenever you like.',
    ],
    players: 'One answers, one asks',
    minutes: 15,
  },
  {
    id: 'love-language',
    title: 'Love Language Quiz',
    icon: 'HeartHandshake',
    rule: 'Choose what feels more like love to you and get your top love language.',
    howTo: [
      'Answer ten quick either-or questions about yourself.',
      'Your answers are scored across the five love languages.',
      'Hand the phone over so your partner can take it too.',
    ],
    players: 'One at a time',
    minutes: 5,
  },
  {
    id: 'most-likely-to',
    title: 'Who’s More Likely To',
    icon: 'Users',
    rule: 'Both vote on who is more likely to do it, then see if you agree.',
    howTo: [
      'The first partner votes in secret.',
      'Pass the phone. The second partner votes.',
      'Reveal to see if you agreed. Matches are counted.',
    ],
    players: 'Pass the phone',
    minutes: 10,
  },
  {
    id: 'compliment-battle',
    title: 'Compliment Battle',
    icon: 'MessageCircleHeart',
    rule: 'Take turns giving specific compliments before the timer runs out.',
    howTo: [
      'Each turn lasts 30 seconds. Three turns each.',
      'Give compliments that are specific, not generic.',
      'The listener taps the heart for every one that lands.',
      'Most hearts wins, but honestly you both do.',
    ],
    players: 'Take turns',
    minutes: 4,
  },
  {
    id: 'date-roulette',
    title: 'Date Night Roulette',
    icon: 'Dices',
    rule: 'Spin for a date idea. Filter by indoor or outdoor and budget.',
    howTo: [
      'Set where you want to be and how much you want to spend.',
      'Spin. Do not like it? Spin again.',
      'Lock in the one that makes you both smile.',
    ],
    players: 'Together',
    minutes: 1,
  },
  {
    id: 'couple-bingo',
    title: 'Couple Bingo',
    icon: 'Grid3x3',
    rule: 'Tick off couple activities. Complete a line to call bingo.',
    howTo: [
      'Each square is something to do together.',
      'Tap a square when you have done it. Tap again to undo.',
      'Any full row, column or diagonal is a bingo. Your card is saved on this device.',
    ],
    players: 'Together, over time',
    minutes: null,
  },
];

export const TRUTH_OR_DARE = {
  mild: {
    truth: [
      'What was your very first impression of me?',
      'What is a small habit of mine you secretly love?',
      'When did you first realise you liked me more than a friend?',
      'What is the most romantic thing you have ever imagined us doing?',
      'Which outfit of mine is your favourite?',
      'What is one thing you have never told me because it felt silly?',
      'What song makes you think of me?',
      'What is your favourite memory of us from this year?',
      'What is something I do that instantly makes your day better?',
      'If you could relive one date with me, which one would it be?',
    ],
    dare: [
      'Give me a thirty second shoulder massage.',
      'Text me something sweet right now, even though I am next to you.',
      'Do your best impression of me when I am hungry.',
      'Slow dance with me for one whole song.',
      'Tell me three things you love about my face.',
      'Write a two line poem about us and read it out loud.',
      'Hold my hand and do not let go until your next turn.',
      'Recreate our first selfie together.',
      'Serenade me with the chorus of any love song.',
      'Plan our next date in under sixty seconds, out loud.',
    ],
  },
  spicy: {
    truth: [
      'What is the most attractive thing I do without realising?',
      'Where is the most unexpected place you have wanted to kiss me?',
      'What is something you want us to try together this year?',
      'What was going through your head on our first kiss?',
      'Which look of mine makes you lose your train of thought?',
      'What is your favourite way for me to say good morning?',
      'What is one compliment you want to hear from me more often?',
      'What is the boldest thing you have wanted to say to me but held back?',
      'When do you find me hardest to resist?',
      'What is your idea of a perfect lazy morning with me?',
    ],
    dare: [
      'Kiss me somewhere other than my lips.',
      'Whisper something flirty in my ear.',
      'Give me your most dramatic movie-style kiss.',
      'Describe our perfect night in, in a low voice.',
      'Let me pick a nickname you have to answer to for the rest of the night.',
      'Look into my eyes for thirty seconds without laughing.',
      'Show me your best flirty wink and pick-up line.',
      'Trace a word on my back. I have to guess it.',
      'Give me a compliment that makes me blush.',
      'Dance like nobody is watching, but I am.',
    ],
  },
};

export const WOULD_YOU_RATHER = [
  { a: 'Go on a spontaneous road trip', b: 'Plan a dream vacation for a year' },
  { a: 'Cook dinner together', b: 'Order in and watch a movie' },
  { a: 'Get a handwritten letter', b: 'Get a surprise voice note' },
  { a: 'Sunrise hike', b: 'Midnight drive' },
  { a: 'Re-watch our favourite show', b: 'Start a brand new one together' },
  { a: 'Live by the beach', b: 'Live in the mountains' },
  { a: 'Slow dance in the kitchen', b: 'Karaoke duet in the car' },
  { a: 'Have a picnic in the park', b: 'Have a candlelit dinner at home' },
  { a: 'Always know what I am thinking', b: 'Always know what I am feeling' },
  { a: 'Matching tattoos', b: 'Matching outfits for a day' },
];

export const NEVER_HAVE_I_EVER = [
  'Never have I ever stalked an ex online.',
  'Never have I ever pretended to like a gift.',
  'Never have I ever fallen asleep during a movie date.',
  'Never have I ever practised a conversation in the mirror.',
  'Never have I ever sent a text to the wrong person.',
  'Never have I ever eaten the last bite and blamed someone else.',
  'Never have I ever written a love letter.',
  'Never have I ever danced in the rain.',
  'Never have I ever lied about being on my way.',
  'Never have I ever had a crush on a cartoon character.',
];

export const KNOW_ME_QUESTIONS = [
  'What is my comfort food after a long day?',
  'What is the one place I would visit tomorrow if I could?',
  'Which song do I never skip?',
  'What is my biggest pet peeve?',
  'What would I order at Zorko cafe without looking at the menu?',
  'What did I want to be when I was a kid?',
  'What is my favourite way to spend a Sunday?',
  'What is the one thing I would save in a fire?',
];

export const RAPID_FIRE = [
  'Tea or coffee?', 'Beach or mountains?', 'Early bird or night owl?', 'Sweet or savoury?',
  'Call or text?', 'Books or movies?', 'Cats or dogs?', 'Pizza or biryani?',
  'Window or aisle?', 'Plan or improvise?', 'Rain or sunshine?', 'Big party or small dinner?',
  'First thing you notice about me?', 'Favourite date so far?', 'Best gift I gave you?',
  'One word for us?', 'Dream holiday?', 'Song stuck in your head?', 'Hidden talent?',
  'Favourite thing I cook?', 'Who said I love you first?', 'Our song?', 'Pet name you secretly like?',
  'Cuddle or space when sad?', 'Breakfast in bed or brunch out?', 'Best trip together?',
  'Celebrity crush?', 'Worst movie we watched?', 'What makes me laugh most?', 'Favourite photo of us?',
];

export const HOT_SEAT = [
  'What is something you are proud of that you do not talk about much?',
  'When do you feel most loved by me?',
  'What is a fear you have about the future?',
  'Which moment changed how you see our relationship?',
  'What do you need more of from me right now?',
  'What is a dream you have not said out loud yet?',
  'What does home feel like to you?',
  'What is one thing you would like us to do differently this year?',
  'How do you want to be comforted when you are stressed?',
  'What is the kindest thing someone has done for you?',
  'What do you hope people say about us in twenty years?',
  'What part of yourself are you still learning to love?',
];

export const LOVE_LANGUAGES = {
  words: { label: 'Words of Affirmation', blurb: 'Kind, specific words land deepest. Say it out loud, and often.' },
  time: { label: 'Quality Time', blurb: 'Undivided attention is the gift. Phones down, eyes up.' },
  gifts: { label: 'Receiving Gifts', blurb: 'Thoughtful tokens say "I was thinking of you" better than anything.' },
  acts: { label: 'Acts of Service', blurb: 'Doing something to make life easier is love in action.' },
  touch: { label: 'Physical Touch', blurb: 'A hand to hold, a hug that lasts. Closeness is the message.' },
};

export const LOVE_LANGUAGE_QUIZ = [
  { a: { text: 'Hearing "I am proud of you"', lang: 'words' }, b: { text: 'A long hug after a hard day', lang: 'touch' } },
  { a: { text: 'An evening with no phones, just us', lang: 'time' }, b: { text: 'A small surprise gift', lang: 'gifts' } },
  { a: { text: 'Coming home to a cleaned-up kitchen', lang: 'acts' }, b: { text: 'A sweet note in my bag', lang: 'words' } },
  { a: { text: 'Holding hands on a walk', lang: 'touch' }, b: { text: 'Planning a whole day together', lang: 'time' } },
  { a: { text: 'A souvenir from their trip', lang: 'gifts' }, b: { text: 'Them running an errand for me', lang: 'acts' } },
  { a: { text: 'A compliment out of nowhere', lang: 'words' }, b: { text: 'A thoughtful birthday present', lang: 'gifts' } },
  { a: { text: 'Cuddling during a movie', lang: 'touch' }, b: { text: 'Them cooking my favourite meal', lang: 'acts' } },
  { a: { text: 'A long, deep conversation', lang: 'time' }, b: { text: 'A text saying they miss me', lang: 'words' } },
  { a: { text: 'Flowers for no reason', lang: 'gifts' }, b: { text: 'A shoulder rub', lang: 'touch' } },
  { a: { text: 'Them handling a task I dread', lang: 'acts' }, b: { text: 'A weekend trip, just the two of us', lang: 'time' } },
];

export const MOST_LIKELY_TO = [
  'Who is more likely to cry during a movie?',
  'Who is more likely to forget an anniversary?',
  'Who is more likely to plan a surprise?',
  'Who is more likely to fall asleep first?',
  'Who is more likely to get lost with GPS on?',
  'Who is more likely to say sorry first?',
  'Who is more likely to eat dessert before dinner?',
  'Who is more likely to start a dance party in the kitchen?',
  'Who is more likely to text "on my way" while still at home?',
  'Who is more likely to adopt a pet without asking?',
];

// budget: 0 = free, 1 = low, 2 = treat
export const DATE_IDEAS = [
  { title: 'Blanket fort movie marathon', where: 'indoor', budget: 0 },
  { title: 'Cook a dish from a country neither of you has visited', where: 'indoor', budget: 1 },
  { title: 'Board game and snack night', where: 'indoor', budget: 0 },
  { title: 'Paint portraits of each other', where: 'indoor', budget: 1 },
  { title: 'At-home tasting night: chocolate, cheese or chai', where: 'indoor', budget: 1 },
  { title: 'Fancy dinner at a place you have bookmarked', where: 'indoor', budget: 2 },
  { title: 'Pottery or cooking class together', where: 'indoor', budget: 2 },
  { title: 'Write letters to open on your next anniversary', where: 'indoor', budget: 0 },
  { title: 'Sunrise walk and street-side breakfast', where: 'outdoor', budget: 1 },
  { title: 'Picnic in the park with a playlist', where: 'outdoor', budget: 1 },
  { title: 'Stargazing with a flask of hot chocolate', where: 'outdoor', budget: 0 },
  { title: 'Explore a neighbourhood you have never walked', where: 'outdoor', budget: 0 },
  { title: 'Coffee date at Zorko cafe, phones away', where: 'outdoor', budget: 1 },
  { title: 'Day trip to the nearest hill or lake', where: 'outdoor', budget: 2 },
  { title: 'Live music or a comedy show', where: 'outdoor', budget: 2 },
  { title: 'Bike ride to a new dessert spot', where: 'outdoor', budget: 1 },
];

export const BINGO_SQUARES = [
  'Cook a new recipe', 'Watch the sunrise', 'Slow dance at home', 'Write a love note', 'Try a new cafe',
  'Phone-free evening', 'Take a silly selfie', 'Plan a trip', 'Breakfast in bed', 'Long walk, no destination',
  'Stargaze', 'Learn a dance', 'Free space', 'Recreate our first date', 'Build a playlist together',
  'Picnic', 'Game night', 'Tiny surprise gift', 'Watch a childhood movie', 'Volunteer together',
  'Visit a museum', 'Bake something', 'Say three compliments', 'Sunset drive', 'Frame a favourite photo',
];
