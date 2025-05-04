export default function RulesPage() {
  return (
    <main className="min-h-screen w-screen -mt-24 flex flex-col items-center justify-center px-4 py-8 md:py-12 bg-zinc-900">
      <div className="max-w-2xl w-full bg-zinc-900 rounded-xl p-4 md:p-8 shadow-lg border border-zinc-800">
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-white mb-6 tracking-wider text-center">Game Rules</h1>
        <ol className="list-decimal list-inside text-base md:text-lg font-serif text-white space-y-3 md:space-y-4">
          <li>
            <span className="font-bold">Guess the Word:</span> You have 6 chances to guess a secret 5-letter word.
          </li>
          <li>
            <span className="font-bold">Each Guess:</span> Enter a valid 5-letter word and press Enter.
          </li>
          <li>
            <span className="font-bold">Color Feedback:</span> After each guess, the color of the tiles will change to show how close your guess was to the word:
            <ul className="list-disc list-inside ml-4 md:ml-6 mt-2 space-y-1 text-sm md:text-base">
              <li><span className="inline-block w-3 md:w-4 h-3 md:h-4 bg-[#6ca965] border border-zinc-700 align-middle mr-2"></span> <span className="font-bold">Green:</span> Correct letter in the correct spot.</li>
              <li><span className="inline-block w-3 md:w-4 h-3 md:h-4 bg-[#c8b653] border border-zinc-700 align-middle mr-2"></span> <span className="font-bold">Yellow:</span> Correct letter in the wrong spot.</li>
              <li><span className="inline-block w-3 md:w-4 h-3 md:h-4 bg-zinc-700 border border-zinc-700 align-middle mr-2"></span> <span className="font-bold">Gray:</span> Letter is not in the word at all.</li>
            </ul>
          </li>
          <li>
            <span className="font-bold">Multiplayer:</span> In multiplayer, the first player to guess the word correctly wins. If neither player guesses in 6 tries, it's a draw.
          </li>
          <li>
            <span className="font-bold">Challenge a Friend:</span> Use the "Challenge a Friend" mode to play directly against your friends in real time.
          </li>
        </ol>
        <div className="mt-6 md:mt-8 text-center text-white font-serif text-base md:text-lg">
          Good luck and have fun!
        </div>
      </div>
    </main>
  );
} 