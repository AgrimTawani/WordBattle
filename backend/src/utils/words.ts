// List of 5-letter words for the game
const words = [
  'APPLE', 'BEACH', 'CLOUD', 'DREAM', 'EARTH',
  'FLAME', 'GHOST', 'HEART', 'IVORY', 'JUICE',
  'KNIFE', 'LIGHT', 'MAGIC', 'NIGHT', 'OCEAN',
  'PEACE', 'QUEEN', 'RADIO', 'SMILE', 'TIGER',
  'UNITY', 'VOICE', 'WATER', 'YOUTH', 'ZEBRA'
];

export function getRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
} 