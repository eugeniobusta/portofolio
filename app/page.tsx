"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar            from "@/components/Navbar";
import BackgroundAmbience from "@/components/BackgroundAmbience";
import Hero               from "@/components/sections/Hero";
import About              from "@/components/sections/About";
import Projects           from "@/components/sections/Projects";
import Skills             from "@/components/sections/Skills";
import Contact            from "@/components/sections/Contact";
import GamePortal         from "@/components/GamePortal";
import Footer             from "@/components/Footer";

export default function Home() {
  const [gameOpen, setGameOpen] = useState(false);

  return (
    <>
      <BackgroundAmbience />
      <Navbar />

      {/*
       * motion.main scales + blurs when the game portal opens.
       * relative z-10 keeps it above the fixed BackgroundAmbience (z-0).
       */}
      <motion.main
        className="relative z-10"
        animate={{
          scale:   gameOpen ? 0.96 : 1,
          opacity: gameOpen ? 0    : 1,
          filter:  gameOpen ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ type: "spring", damping: 32, stiffness: 280, mass: 0.9 }}
        style={{ pointerEvents: gameOpen ? "none" : "auto" }}
      >
        <Hero     onGameOpen={() => setGameOpen(true)} />
        <About    />
        <Projects />
        <Skills   />
        <Contact  />
        <Footer   />
      </motion.main>

      {/* AnimatePresence runs exit animation before portal is removed from DOM */}
      <AnimatePresence>
        {gameOpen && <GamePortal onClose={() => setGameOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
