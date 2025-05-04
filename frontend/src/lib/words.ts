const words = [
  "apple", "beach", "chair", "dance", "eagle", "flame", "ghost", "heart",
  "igloo", "joker", "knife", "lemon", "music", "night", "ocean", "piano",
  "queen", "river", "snake", "tiger", "umbra", "voice", "water", "xenon",
  "yacht", "zebra"
];

export async function getRandomWord(): Promise<string> {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
} 