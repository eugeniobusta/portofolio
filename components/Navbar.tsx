"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, Moon, Sun } from "@phosphor-icons/react";

const links = [
  { label: "About",    href: "#about"    },
  { label: "Projects", href: "#projects" },
  { label: "Skills",   href: "#skills"   },
  { label: "Contact",  href: "#contact"  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark,     setDark]     = useState(false);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  /* Detect scroll via IntersectionObserver on a sentinel div at page top */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Read saved theme preference on mount */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
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
              ? "bg-paper/92 border-frame shadow-[0_2px_16px_oklch(0%_0_0_/_0.05)] backdrop-blur-md"
              : "bg-paper/70  border-frame/60 backdrop-blur-sm",
          ].join(" ")}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Monogram */}
          <a
            href="#"
            className="font-serif text-lg leading-none tracking-tight text-ink hover:text-accent transition-colors duration-200"
            aria-label="Back to top"
          >
            EB
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted hover:text-ink px-3 py-1.5 rounded-full hover:bg-surface transition-all duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right side: theme toggle + mobile hamburger */}
          <div className="flex items-center gap-1">
            {/* Theme toggle — Sun/Moon */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-all duration-200"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark
                ? <Sun  size={15} weight="bold" />
                : <Moon size={15} weight="bold" />
              }
            </button>

            {/* Mobile hamburger */}
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
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col items-center gap-2" role="list">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="block text-3xl font-serif text-ink hover:text-accent transition-colors duration-200 py-2 px-6"
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
