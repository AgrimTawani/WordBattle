import React, { useEffect, useState } from "react";

const LETTERS = "SEARCHING".split("");
const COLORS = [
  "bg-white text-black border-gray-300",
  "bg-green-500 text-white border-green-700",
  "bg-yellow-500 text-white border-yellow-700",
  "bg-gray-500 text-white border-gray-700"
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function SearchingTiles() {
  const [flipping, setFlipping] = useState<number[]>([]);
  const [tileColors, setTileColors] = useState<string[]>(
    Array(LETTERS.length).fill(COLORS[0])
  );

  useEffect(() => {
    const flipTiles = () => {
      // Pick 2-3 random indices to flip
      const count = 2 + Math.floor(Math.random() * 2);
      const indices = Array.from({ length: LETTERS.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
      setFlipping(indices);

      // After flip, change their color
      setTimeout(() => {
        setTileColors((prev) =>
          prev.map((color, i) =>
            indices.includes(i) ? randomColor() : color
          )
        );
        setFlipping([]);
      }, 1200); // match animation duration
    };

    const interval = setInterval(flipTiles, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 w-screen justify-center">
      {LETTERS.map((letter, i) => (
        <div
          key={i}
          className="w-20 h-20"
          style={{ perspective: 400, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            className={`w-full h-full border-2 flex items-center justify-center text-4xl font-bold font-mono transition-colors duration-300 ${tileColors[i]} ${
              flipping.includes(i)
                ? "animate-[flipXslow_1.2s_linear]"
                : ""
            }`}
            style={{
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden"
            }}
          >
            <span style={{ display: "block" }}>
              {letter}
            </span>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes flipXslow {
          0% { transform: rotateX(0deg);}
          100% { transform: rotateX(-180deg);}
        }
      `}</style>
    </div>
  );
} 