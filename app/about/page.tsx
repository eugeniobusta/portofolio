"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

/* ── Fade-up reveal used throughout ───────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Photo placeholder — swap src once you have real photos ────── */
function Photo({
  src,
  alt,
  aspect = "square",
  className = "",
}: {
  src?: string;
  alt: string;
  aspect?: "square" | "portrait" | "wide";
  className?: string;
}) {
  const aspectClass =
    aspect === "portrait" ? "aspect-[3/4]" :
    aspect === "wide"     ? "aspect-[16/9]" :
                            "aspect-square";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${aspectClass} ${className}`}
      style={{ background: "rgba(200,149,44,0.08)", border: "1px solid rgba(200,149,44,0.15)" }}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #c8952c, transparent)" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(200,149,44,0.35)", letterSpacing: "0.08em" }}>
            photo soon
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Thin amber divider ─────────────────────────────────────────── */
function Divider() {
  return (
    <div className="my-16 flex items-center gap-4">
      <div className="flex-1 h-px" style={{ background: "rgba(200,149,44,0.15)" }} />
      <div className="w-1 h-1 rounded-full" style={{ background: "rgba(200,149,44,0.4)" }} />
      <div className="flex-1 h-px" style={{ background: "rgba(200,149,44,0.15)" }} />
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function AboutPage() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{ background: "#0d0b09", minHeight: "100vh", color: "#f0ebe3" }}>

      {/* ── entrance fade from the orange portal ── */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.0, delay: 0.1 }}
        style={{
          position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none",
          background: "radial-gradient(circle at 72% 72%, #ff8822 0%, #ffcc66 40%, #fff8ee 100%)",
        }}
      />

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 120px" }}>

        {/* ── back link ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{ paddingTop: 40, paddingBottom: 8 }}
        >
          <Link
            href="/"
            style={{
              fontSize: 12, fontFamily: "monospace",
              color: "rgba(200,149,44,0.5)", textDecoration: "none",
              letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            ← back to the portfolio
          </Link>
        </motion.div>

        {/* ══════════════════════════════════════════════
            OPENING
        ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ paddingTop: 64, paddingBottom: 8 }}
        >
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.7)",
          }}>
            you made it to the corner
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-instrument)",
            fontSize: "clamp(2.6rem, 8vw, 4.2rem)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            margin: "12px 0 20px", fontWeight: 400,
          }}
        >
          The long version.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.1 }}
          style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(240,235,227,0.6)", maxWidth: 520 }}
        >
          Most people see the portfolio and move on. You drove a jeep to the corner
          of a 3D world to find this. That already tells me something about you.
        </motion.p>

        <Divider />

        {/* ══════════════════════════════════════════════
            PHOTO + ORIGIN
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-[1fr_1fr] gap-5 mb-10">
          <Reveal delay={0}>
            <Photo alt="Eugenio portrait" aspect="portrait" />
          </Reveal>
          <Reveal delay={0.12} className="flex flex-col justify-end gap-5">
            <Photo alt="Eugenio out" aspect="square" />
            <Photo alt="Eugenio somewhere" aspect="square" />
          </Reveal>
        </div>

        <Reveal>
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.6)",
          }}>
            A few places, one person
          </span>
          <h2 style={{
            fontFamily: "var(--font-instrument)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.15, letterSpacing: "-0.015em", margin: "10px 0 18px", fontWeight: 400,
          }}>
            Málaga. England. Madrid. Paris. Dublin.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)" }}>
            I grew up in Málaga. At seven I moved to England — long enough for English to stop
            feeling foreign, long enough that it became part of me. At twelve, Madrid. I finished
            school there while doing a dual diploma online from an American program for three years,
            running both in parallel. Then a few months in Paris with a host family, keeping French
            alive the way you only can by living it.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            In 2025 I packed up and came to Dublin for Computer Science at DCU. Three countries,
            three languages, and one thing that was always there — a computer screen in front of me.
          </p>
        </Reveal>

        <Divider />

        {/* ══════════════════════════════════════════════
            HOW IT STARTED
        ══════════════════════════════════════════════ */}
        <Reveal>
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.6)",
          }}>
            How it started
          </span>
          <h2 style={{
            fontFamily: "var(--font-instrument)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.15, letterSpacing: "-0.015em", margin: "10px 0 18px", fontWeight: 400,
          }}>
            The first time I touched a computer, I just wanted to know everything it could do.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)" }}>
            Not build anything — just explore. Every shortcut, every setting, every corner of
            the file system. I was twelve when I wrote my first Python. Didn't stick with it.
            Then I found HTML, CSS, JavaScript — and realised I could build anything I imagined,
            exactly how I wanted it. That was the moment.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            My advice to anyone starting out: don't take a course. Just fidget. Explore everything.
            See what the machine can actually do at its fullest.
          </p>
        </Reveal>

        <Divider />

        {/* ══════════════════════════════════════════════
            LIFE OUTSIDE CODE
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-5 mb-10">
          <Reveal delay={0}><Photo alt="Tennis" aspect="wide" /></Reveal>
          <Reveal delay={0.1}><Photo alt="Music" aspect="wide" /></Reveal>
        </div>

        <Reveal>
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.6)",
          }}>
            Outside the screen
          </span>
          <h2 style={{
            fontFamily: "var(--font-instrument)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.15, letterSpacing: "-0.015em", margin: "10px 0 18px", fontWeight: 400,
          }}>
            Tennis, every day. Music, every day.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)" }}>
            If I could do one sport for the rest of my life it would be tennis. No question.
            The gym too — daily, no particular reason, I just like it. And music: piano, guitar,
            ukulele, drums. I compose as well — I have my own pieces made with software.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            Music and code feel similar to me. Both are about building something from nothing
            and making it feel inevitable once it exists.
          </p>
        </Reveal>

        <Divider />

        {/* ══════════════════════════════════════════════
            AI OPINION
        ══════════════════════════════════════════════ */}
        <Reveal>
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.6)",
          }}>
            An honest opinion
          </span>
          <h2 style={{
            fontFamily: "var(--font-instrument)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.15, letterSpacing: "-0.015em", margin: "10px 0 18px", fontWeight: 400,
          }}>
            AI is just the next layer. Assembly. C. Python. Claude. Same idea, bigger jump.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)" }}>
            We didn't stop learning C because Python existed. We learned to use Python because
            it was more powerful. Same thing is happening now. We shouldn't be learning to code
            instead of using AI — we should be learning to code <em>with</em> AI. That's not
            laziness. That's just how the stack evolves.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            Here's what I actually think though: in a few years, websites won't be built for
            humans to browse. They'll be endpoints for AI agents. The beautiful animations,
            the hero sections, all of it — built for machines to read, not people to see.
            This page might be one of the last generations of things built to be pretty for people.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            I find that exciting, not sad.
          </p>
        </Reveal>

        <Divider />

        {/* ══════════════════════════════════════════════
            FUTURE
        ══════════════════════════════════════════════ */}
        <Reveal>
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.6)",
          }}>
            Where I'm headed
          </span>
          <h2 style={{
            fontFamily: "var(--font-instrument)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.15, letterSpacing: "-0.015em", margin: "10px 0 18px", fontWeight: 400,
          }}>
            Simple goals.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)" }}>
            Own Pitch and make something real out of it. Prove that discipline gets you wherever
            you decide to go — not talent, not luck, discipline. Work for myself, or if for
            someone else, in the most respectful and honest way possible.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            Travel everywhere. See everything. Stay curious.
          </p>
        </Reveal>

        <Divider />

        {/* ══════════════════════════════════════════════
            PITCH CTA
        ══════════════════════════════════════════════ */}
        <Reveal>
          <span style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(200,149,44,0.6)",
          }}>
            The adventure
          </span>
          <h2 style={{
            fontFamily: "var(--font-instrument)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            lineHeight: 1.15, letterSpacing: "-0.015em", margin: "10px 0 18px", fontWeight: 400,
          }}>
            I'm building Pitch. Join if you want.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)" }}>
            Pitch is a networking platform for founders and investors — think LinkedIn, but built
            specifically for this world. Premium, focused, something people actually feel they need
            to have. A place where a startup can show everything it's about and find the investor
            who believes in it.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.82, color: "rgba(240,235,227,0.65)", marginTop: 14 }}>
            If you're a developer, designer, or just someone who believes in the idea and wants
            to be part of building it — I'm genuinely open to it. Not looking for investment,
            not looking for a pitch meeting. Just someone who wants to build something real.
          </p>
        </Reveal>

        {/* Contact cards */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-3 mt-8">
            <a
              href="mailto:eugeniobrb@icloud.com"
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "20px 22px", borderRadius: 14, textDecoration: "none",
                background: "rgba(200,149,44,0.07)", border: "1px solid rgba(200,149,44,0.2)",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(200,149,44,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,44,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(200,149,44,0.07)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,44,0.2)";
              }}
            >
              <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(200,149,44,0.6)", textTransform: "uppercase" }}>Email</span>
              <span style={{ fontSize: 13, color: "#f0ebe3", fontFamily: "monospace" }}>eugeniobrb@icloud.com</span>
            </a>
            <a
              href="https://wa.me/34697476663"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "20px 22px", borderRadius: 14, textDecoration: "none",
                background: "rgba(200,149,44,0.07)", border: "1px solid rgba(200,149,44,0.2)",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(200,149,44,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,44,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(200,149,44,0.07)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,44,0.2)";
              }}
            >
              <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(200,149,44,0.6)", textTransform: "uppercase" }}>WhatsApp</span>
              <span style={{ fontSize: 13, color: "#f0ebe3", fontFamily: "monospace" }}>+34 697 476 663</span>
            </a>
          </div>
        </Reveal>

        {/* ══════════════════════════════════════════════
            SIGN-OFF
        ══════════════════════════════════════════════ */}
        <Reveal delay={0.05}>
          <div style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid rgba(200,149,44,0.12)" }}>
            <p style={{
              fontFamily: "var(--font-instrument)", fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
              color: "rgba(240,235,227,0.45)", lineHeight: 1.6, fontStyle: "italic",
            }}>
              "Thanks for making it to the corner."
            </p>
            <p style={{ marginTop: 12, fontSize: 13, fontFamily: "monospace", color: "rgba(200,149,44,0.5)" }}>
              — Eugenio
            </p>
            <div style={{ marginTop: 28 }}>
              <Link
                href="/"
                style={{
                  fontSize: 12, fontFamily: "monospace", color: "rgba(200,149,44,0.45)",
                  textDecoration: "none", letterSpacing: "0.06em",
                }}
              >
                ← back to the portfolio
              </Link>
            </div>
          </div>
        </Reveal>

      </div>
    </main>
  );
}
