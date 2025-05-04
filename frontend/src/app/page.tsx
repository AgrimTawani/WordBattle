"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Gamepad2 } from "lucide-react";
import FallingTilesBackground from "@/components/FallingTilesBackground";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handlePlay = () => {
    if (isSignedIn) {
      router.push("/findingUsers");
    } else {
      alert("Please sign in to play!");
    }
  };

  return (
    <>
      <main className="min-h-screen w-screen bg-zinc-900 flex items-center justify-center">
        <div className="w-fit px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold font-serif text-white mb-4 tracking-wider text-center">WordBattle</h1>
          <p className="text-xl md:text-2xl font-serif text-white text-center mb-12">A wordle battleground for you and your friends.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <GameMode
              index={0}
              title="Classic"
              description="Traditional 5x5 Wordle"
              color="yellow"
              onClick={handlePlay}
            />
            <GameMode
              index={1}
              title="Wordy"
              description="Extended 6x6 Grid"
              color="green"
              onClick={() => router.push("/findingUsers?mode=wordy")}
            />
            <GameMode
              index={2}
              title="Challenge a Friend"
              description="Direct match with friends"
              color="gray"
              onClick={() => router.push("/friends")}
            />
            <GameMode
              index={3}
              title="Wordle Rush"
              description="Speed mode with time limit"
              color="white"
              onClick={() => router.push("/game/rush")}
            />
          </div>
        </div>
      </main>
    </>
  );
}

function GameMode({ title, description, index, onClick, color }: { title: string; description: string; index: number; onClick: () => void; color: 'yellow' | 'green' | 'gray' | 'white' }) {
  let bg = 'bg-wordle-yellow', text = 'text-white', border = 'border-wordle-gray';
  if (color === 'green') {
    bg = 'bg-wordle-green'; text = 'text-white';
  } else if (color === 'gray') {
    bg = 'bg-wordle-gray'; text = 'text-white';
  } else if (color === 'white') {
    bg = 'bg-wordle-white'; text = 'text-black';
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
      className={`aspect-square ${bg} ${text} ${border} border rounded-xl p-4 md:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-center items-center text-center font-serif shadow-md hover:scale-105`}
      onClick={onClick}
    >
      <h3 className="text-lg md:text-xl font-bold mb-2 tracking-wider font-serif">{title}</h3>
      <p className="text-sm md:text-base font-serif">{description}</p>
    </motion.div>
  );
}