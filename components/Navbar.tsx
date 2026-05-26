"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, Moon, Sun } from "@phosphor-icons/react";

const links = [
  { label: "About",    href: "#about",    id: "about"    },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Skills",   href: "#skills",   id: "skills"   },
  { label: "Contact",  href: "#contact",  id: "contact"  },
];

export default function Navbar() {
  const [scrolled,       setScrolled]       = useState(false);
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [dark,           setDark]           = useState(false);
  const [activeSection,  setActiveSection]  = useState<string>("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Scroll detection via IntersectionObserver on a 1px sentinel div at top */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Active section tracking — fires when a section center crosses the viewport midpoint */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    links.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* Restore saved theme on mount */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") { document.documentElement.classList.add("dark"); setDark(true); }
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div ref={sentinelRef} className="absolute top-0 left-0 h-1 w-full pointer-events-none" aria-hidden />

      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-5 px-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={[
            "flex items-center gap-6 px-4 py-2.5 rounded-full transition-all duration-300 border",
            scrolled
              ? "bg-paper/92 border-frame shadow-[0_2px_16px_oklch(0%_0_0_/_0.06)] backdrop-blur-md"
              : "bg-paper/70  border-frame/60 backdrop-blur-sm",
          ].join(" ")}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Monogram */}
          <a href="#"
            className="font-serif text-lg leading-none tracking-tight text-ink hover:text-accent transition-colors duration-200"
            aria-label="Back to top">
            EB
          </a>

          {/* Desktop links — liquid glass indicator via layoutId */}
          <ul className="hidden md:flex items-center gap-0.5" role="list">
            {links.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.href} className="relative">
                  <a
                    href={link.href}
                    className={[
                      "relative text-sm px-3 py-1.5 rounded-full block transition-colors duration-200 z-10",
                      isActive ? "text-ink" : "text-muted hover:text-ink",
                    ].join(" ")}
                  >
                    {/* Liquid glass pill — Framer Motion animates it between positions */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "var(--surface)", border: "1px solid var(--frame)" }}
                        transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.8 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right side: theme toggle + mobile hamburger */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-all duration-200"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={15} weight="bold" /> : <Moon size={15} weight="bold" />}
            </button>

            <button
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-all duration-200"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-paper/96 backdrop-blur-md flex flex-col items-center justify-center"
            role="dialog" aria-modal="true" aria-label="Mobile navigation"
          >
            <ul className="flex flex-col items-center gap-2" role="list">
              {links.map((link, i) => (
                <motion.li key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a href={link.href} onClick={closeMenu}
                    className={[
                      "block text-3xl font-serif transition-colors duration-200 py-2 px-6",
                      activeSection === link.id ? "text-accent" : "text-ink hover:text-accent",
                    ].join(" ")}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
