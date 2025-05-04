import React, { useEffect, useRef, useState } from "react";

const COLORS = [
  "bg-white text-black border-gray-300",
  "bg-green-500 text-white border-green-700",
  "bg-yellow-500 text-white border-yellow-700",
  "bg-gray-500 text-white border-gray-700"
];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TILE_SIZE = 24; // px
const TILE_COUNT = 15; // fewer tiles
const FALL_SPEED = 0.08; // px per ms (slower)
const BOUNCE_FACTOR = 0.7; // how much speed is retained after bounce

function randomTile(windowWidth: number, windowHeight: number) {
  return {
    x: Math.random() * (windowWidth - TILE_SIZE),
    y: Math.random() * windowHeight - windowHeight,
    letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: FALL_SPEED * (0.5 + Math.random()), // randomize speed a bit
    vy: FALL_SPEED * (0.5 + Math.random()), // vertical speed
    vx: (Math.random() - 0.5) * 0.1 // small horizontal nudge
  };
}

export default function FallingTilesBackground() {
  const [tiles, setTiles] = useState<any[]>([]);
  const animationRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mouse, setMouse] = useState({ x: -1000, y: -1000 }); // offscreen initially

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    setTiles(
      Array.from({ length: TILE_COUNT }).map(() =>
        randomTile(dimensions.width, dimensions.height)
      )
    );
  }, [dimensions]);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    let last = performance.now();
    function animate(now: number) {
      const dt = now - last;
      last = now;
      setTiles((prev) =>
        prev.map((tile) => {
          let { x, y, vx, vy } = tile;
          // Move tile
          x += vx * dt;
          y += vy * dt;

          // Bounce off left/right edges
          if (x < 0) { x = 0; vx = -vx; }
          if (x > dimensions.width - TILE_SIZE) { x = dimensions.width - TILE_SIZE; vx = -vx; }

          // Bounce off cursor
          const mx = mouse.x, my = mouse.y;
          if (
            mx >= x &&
            mx <= x + TILE_SIZE &&
            my >= y &&
            my <= y + TILE_SIZE &&
            vy > 0 // only bounce if falling down
          ) {
            vy = -Math.abs(vy) * BOUNCE_FACTOR;
            vx += (Math.random() - 0.5) * 0.2; // add a little random nudge
          } else {
            // Gravity: slowly bring vy back to normal fall speed
            if (vy < FALL_SPEED) vy += 0.0005 * dt;
            if (vy > FALL_SPEED) vy -= 0.0005 * dt;
          }

          // Respawn at top if off bottom
          if (y > dimensions.height) {
            return randomTile(dimensions.width, dimensions.height);
          }
          return { ...tile, x, y, vx, vy };
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, mouse]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ overflow: "hidden" }}
      aria-hidden
    >
      {tiles.map((tile, i) => (
        <div
          key={i}
          className={`absolute flex items-center justify-center border text-xs font-bold shadow ${tile.color}`}
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            left: tile.x,
            top: tile.y,
            opacity: 0.7
          }}
        >
          {tile.letter}
        </div>
      ))}
    </div>
  );
} 