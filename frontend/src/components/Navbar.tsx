"use client";

import { useState } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, LayoutDashboard, ScrollText, Trophy, Star, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const underlineColors = [
  "border-wordle-yellow",
  "border-wordle-green",
  "border-wordle-white",
];

function getRandomUnderline() {
  return underlineColors[Math.floor(Math.random() * underlineColors.length)];
}

function NavButton({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const [hoverColor, setHoverColor] = useState<string>("");
  return (
    <Link href={href} className="inline-block w-full" onClick={onClick}>
      <button
        className={`relative px-3 py-2 text-wordle-white font-sans border-none outline-none bg-transparent transition-colors duration-200 focus:outline-none flex flex-col items-center justify-center w-full`}
        onMouseEnter={() => setHoverColor(getRandomUnderline())}
        onMouseLeave={() => setHoverColor("")}
        style={{ background: "none" }}
      >
        <span className="z-10 flex items-center justify-center w-full">{children}</span>
        <span
          className={`block border-b-2 mt-1 rounded-full transition-all duration-200 ${hoverColor} ${hoverColor ? "w-full" : "w-0"}`}
          style={{ transitionProperty: 'width, border-color' }}
        />
      </button>
    </Link>
  );
}

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-zinc-900 relative z-50">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        <Link 
          href="/" 
          className="flex items-center space-x-2 group"
        >
          <span className="inline-block align-middle">
            <span className="w-7 h-7 bg-white border-2 border-black rounded grid grid-cols-3 grid-rows-3 overflow-hidden inline-block align-middle">
              <span className="col-span-1 row-span-1 border border-black bg-white block" />
              <span className="col-span-1 row-span-1 border border-black bg-[#6ca965] block" />
              <span className="col-span-1 row-span-1 border border-black bg-white block" />
              <span className="col-span-1 row-span-1 border border-black bg-white block" />
              <span className="col-span-1 row-span-1 border border-black bg-[#c8b653] block" />
              <span className="col-span-1 row-span-1 border border-black bg-white block" />
              <span className="col-span-1 row-span-1 border border-black bg-white block" />
              <span className="col-span-1 row-span-1 border border-black bg-[#6ca965] block" />
              <span className="col-span-1 row-span-1 border border-black bg-white block" />
            </span>
          </span>
          <span className="font-extrabold text-xl text-wordle-white font-serif tracking-wider group-hover:text-wordle-white transition-colors duration-200">
            WordBattle
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <NavButton href="/dashboard"><LayoutDashboard size={16} className="mr-2 inline" />Dashboard</NavButton>
                <NavButton href="/rules"><ScrollText size={16} className="mr-2 inline" />Rules</NavButton>
                <NavButton href="/friends"><Users size={16} className="mr-2 inline" />Friends</NavButton>
                <NavButton href="/reviews"><Star size={16} className="mr-2 inline" />Reviews</NavButton>
                <NavButton href="/leaderboard"><Trophy size={16} className="mr-2 inline" />Leaderboard</NavButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="relative px-3 py-1 text-wordle-white font-sans border-none outline-none bg-wordle-yellow hover:bg-wordle-green hover:text-wordle-black transition-colors duration-200 focus:outline-none rounded"
                >
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>

          {/* User Button and Mobile Menu Button */}
          {isSignedIn && (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border-2 border-wordle-yellow/30"
                }
              }}
            />
          )}
          <button
            onClick={toggleMenu}
            className="text-white hover:text-wordle-yellow transition-colors duration-200 md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-zinc-900 border-t border-zinc-800 shadow-lg md:hidden"
          >
            <div className="flex flex-col p-4 space-y-2">
              {isSignedIn ? (
                <>
                  <NavButton href="/dashboard" onClick={closeMenu}><LayoutDashboard size={16} className="mr-2 inline" />Dashboard</NavButton>
                  <NavButton href="/rules" onClick={closeMenu}><ScrollText size={16} className="mr-2 inline" />Rules</NavButton>
                  <NavButton href="/friends" onClick={closeMenu}><Users size={16} className="mr-2 inline" />Friends</NavButton>
                  <NavButton href="/reviews" onClick={closeMenu}><Star size={16} className="mr-2 inline" />Reviews</NavButton>
                  <NavButton href="/leaderboard" onClick={closeMenu}><Trophy size={16} className="mr-2 inline" />Leaderboard</NavButton>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="w-full px-3 py-2 text-wordle-white font-sans border-none outline-none bg-wordle-yellow hover:bg-wordle-green hover:text-wordle-black transition-colors duration-200 focus:outline-none rounded"
                  >
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}