"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar             from "@/components/Navbar";
import BackgroundAmbience from "@/components/BackgroundAmbience";
import Hero               from "@/components/sections/Hero";
import About              from "@/components/sections/About";
import Projects           from "@/components/sections/Projects";
import Skills             from "@/components/sections/Skills";
import Contact            from "@/components/sections/Contact";
import GamePortal         from "@/components/GamePortal";
import Footer             from "@/components/Footer";

export default function Home() {
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [gameOpen,     setGameOpen]     = useState(false);

  const handleGameOpen = () => {
    if (isCollapsing || gameOpen) return;
    setIsCollapsing(true);
    /* Portal opens after the collapse animation has time to play out */
    setTimeout(() => setGameOpen(true), 1250);
  };

  const handleGameClose = () => {
    setGameOpen(false);
    /* Reset so letters snap back while portal exit covers the screen */
    setTimeout(() => setIsCollapsing(false), 50);
  };

  return (
    <>
      <BackgroundAmbience />
      <Navbar isCollapsing={isCollapsing} />

      <main className="relative z-10" style={{ pointerEvents: gameOpen ? "none" : "auto" }}>
        <Hero
          onGameOpen={handleGameOpen}
          isCollapsing={isCollapsing}
        />
        <About    />
        <Projects />
        <Skills   />
        <Contact  />
        <Footer   />
      </main>

      <AnimatePresence>
        {gameOpen && <GamePortal onClose={handleGameClose} />}
      </AnimatePresence>
    </>
  );
}
