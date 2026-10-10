export const verses = [
  {
    text: "Be still, and know that I am God. I will be exalted among the nations. I will be exalted on the earth.",
    reference: "Psalm 46:10",
    category: "Peace",
  },
  {
    text: "Yahweh is my shepherd; I shall lack nothing.",
    reference: "Psalm 23:1",
    category: "Faith",
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13",
    category: "Strength",
  },
  {
    text: "Now faith is assurance of things hoped for, proof of things not seen.",
    reference: "Hebrews 11:1",
    category: "Faith",
  },
  {
    text: "Give thanks to Yahweh, for he is good, for his loving kindness endures forever.",
    reference: "Psalm 107:1",
    category: "Gratitude",
  },
  {
    text: "When I am afraid, I will put my trust in you.",
    reference: "Psalm 56:3",
    category: "Encouragement",
  },
  {
    text: "but those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
    reference: "Isaiah 40:31",
    category: "Hope",
  },
  {
    text: "Let all that you do be done in love.",
    reference: "1 Corinthians 16:14",
    category: "Encouragement",
  },
  {
    text: "Your word is a lamp to my feet, and a light for my path.",
    reference: "Psalm 119:105",
    category: "Faith",
  },
  {
    text: "casting all your worries on him, because he cares for you.",
    reference: "1 Peter 5:7",
    category: "Peace",
  },
  {
    text: "Always rejoice. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you.",
    reference: "1 Thessalonians 5:16–18",
    category: "Gratitude",
  },
  {
    text: "Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.",
    reference: "Psalm 34:18",
    category: "Hope",
  },
];
export type Verse = (typeof verses)[number];
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function dailyVerse(date = new Date()) {
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
  return verses[day % verses.length];
}
export const reflections: Record<string, string> = {
  Peace:
    "Make room for stillness today. You do not have to carry every worry at once. Pause, breathe, and remember that God cares for you.",
  Faith:
    "Faith grows in the ordinary moments. Take one small step in trust today, even when the whole path is not yet clear.",
  Strength:
    "Strength can look like courage, patience, or simply beginning again. Bring what you have to God today.",
  Gratitude:
    "Notice the gifts tucked into an ordinary day. Gratitude invites us to see grace in what we already have.",
  Encouragement:
    "A small act of love can change the shape of a day. Offer the kindness you would hope to receive.",
  Hope: "There is room for hope, even in an unfinished story. Let today be one gentle step toward renewal.",
};
export const challenges = [
  {
    id: "gratitude",
    title: "Seven days of gratitude",
    description: "Find the gifts in the everyday.",
    image: "forest",
    prompts: [
      "Name three simple blessings.",
      "Thank someone who helped you.",
      "Notice something beautiful outdoors.",
      "Write about a lesson you are grateful for.",
      "Give thanks for a small comfort.",
      "Share an act of kindness.",
      "Reflect on the gifts of this week.",
    ],
  },
  {
    id: "prayer",
    title: "A quieter heart",
    description: "Make a little room for prayer.",
    image: "lake",
    prompts: [
      "Spend two minutes in stillness.",
      "Pray for someone you love.",
      "Bring a worry to God.",
      "Pray for your neighborhood.",
      "Listen quietly for five minutes.",
      "Write a prayer of thanks.",
      "Reflect on your week of prayer.",
    ],
  },
  {
    id: "kindness",
    title: "Faith in action",
    description: "Turn a little love into action.",
    image: "sunrise",
    prompts: [
      "Encourage a friend.",
      "Listen without interrupting.",
      "Help with an everyday task.",
      "Offer someone forgiveness.",
      "Share something you have.",
      "Send a thoughtful note.",
      "Reflect on the love you shared.",
    ],
  },
];
