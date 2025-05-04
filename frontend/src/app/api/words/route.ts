import { NextResponse } from 'next/server';

// List of words for the Rush game
const WORD_LIST = [
  "apple", "grape", "peach", "mango", "lemon", "berry", "melon", "plums", "guava", "olive",
  "pear", "kiwi", "lime", "fig", "date", "pine", "coconut", "papaya", "cherry", "banana",
  "orange", "apricot", "nectar", "quince", "prune", "currant", "raisin", "cranberry", "blueberry", "raspberry",
  "strawberry", "blackberry", "gooseberry", "elderberry", "boysenberry", "mulberry", "cloudberry", "huckleberry", "lingonberry", "loganberry",
  "pomegranate", "persimmon", "dragonfruit", "passionfruit", "starfruit", "jackfruit", "durian", "lychee", "rambutan", "mangosteen"
];

export async function GET() {
  // Shuffle the array and return 50 words
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
  return NextResponse.json({ words: shuffled.slice(0, 50) });
} 