"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";

/* ── scroll-reveal ───────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── photo placeholder ───────────────────────────────────────── */
function Photo({ src, alt, style = {} }: { src?: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 18, overflow: "hidden",
      background: "rgba(210,150,60,0.08)",
      border: "1px solid rgba(210,150,60,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      ...style,
    }}>
      {src
        ? <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(180,120,40,0.35)", letterSpacing: "0.1em" }}>photo soon</span>
      }
    </div>
  );
}

/* ── lamp glow ───────────────────────────────────────────────── */
function Lamp({ style = {} }: { style?: React.CSSProperties }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.06, 1], opacity: [1, 0.85, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(220,140,40,0.28) 0%, transparent 68%)",
        filter: "blur(28px)",
        ...style,
      }}
    />
  );
}

/* ── page ────────────────────────────────────────────────────── */
export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const horizonY  = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const sunOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.55, 0.75, 0.95]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ══ FIXED BACKGROUND ══════════════════════════════════════ */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>

        {/* sky to sand gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #f9f6ef 0%, #fef0d5 38%, #fdd89a 60%, #f5aa50 78%, #e07828 92%, #b85a18 100%)",
        }} />

        {/* horizon glow line */}
        <motion.div style={{
          position: "absolute", left: 0, right: 0, top: "64%", height: 180,
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(235,130,30,0.45) 0%, transparent 70%)",
          y: horizonY, opacity: sunOpacity,
        }} />

        {/* sea shimmer */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: "72%", bottom: 0,
          background: "linear-gradient(180deg, rgba(230,140,40,0.22) 0%, rgba(180,90,20,0.12) 100%)",
        }} />

        {/* reading lamps */}
        <Lamp style={{ width: 480, height: 480, left: -120, top: "2%" }} />
        <Lamp style={{ width: 360, height: 360, right: -80,  top: "38%", animationDelay: "1.3s" }} />
        <Lamp style={{ width: 320, height: 320, left: -60,   bottom: "12%" }} />
      </div>

      {/* ══ ENTRANCE fade from orange portal ═════════════════════ */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.05 }}
        style={{
          position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none",
          background: "radial-gradient(circle at 72% 72%, #ff8822 0%, #ffcc66 45%, #fff8ee 100%)",
        }}
      />

      {/* ══ CONTENT ══════════════════════════════════════════════ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 22px 88px" }}>

        {/* back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ paddingTop: 36 }}>
          <Link href="/" style={{
            fontSize: 11, fontFamily: "monospace", letterSpacing: "0.07em",
            color: "rgba(160,95,20,0.55)", textDecoration: "none",
          }}>← portfolio</Link>
        </motion.div>

        {/* ── OPENING ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: 44, marginBottom: 20,
            padding: "28px 30px",
            background: "rgba(255,253,248,0.84)",
            backdropFilter: "blur(18px)",
            borderRadius: 20,
            border: "1px solid rgba(210,150,50,0.18)",
            boxShadow: "0 2px 28px rgba(180,100,20,0.07)",
          }}
        >
          <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(170,95,20,0.5)" }}>
            you found the corner
          </span>
          <h1 style={{
            fontFamily: "var(--font-instrument)",
            fontSize: "clamp(2.4rem, 8vw, 3.6rem)",
            lineHeight: 1.06, letterSpacing: "-0.025em",
            color: "#1a1008", margin: "10px 0 14px", fontWeight: 400,
          }}>
            This is the real page.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.72, color: "#7a6248", margin: 0 }}>
            Most people scroll the portfolio and move on. You drove a jeep to a corner to find this. That already tells me something.
          </p>
        </motion.div>

        {/* ── PHOTO + ID GRID ─────────────────────────────────── */}
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

            <Photo alt="Eugenio" style={{ minHeight: 300 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* name card */}
              <div style={{
                flex: 1, padding: "20px 22px",
                background: "rgba(255,253,248,0.86)", backdropFilter: "blur(14px)",
                borderRadius: 16, border: "1px solid rgba(210,150,50,0.16)",
              }}>
                <div style={{
                  fontFamily: "var(--font-instrument)",
                  fontSize: "1.55rem", lineHeight: 1.15, letterSpacing: "-0.015em", color: "#1a1008",
                }}>
                  Eugenio<br />Bustamante
                </div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { k: "From", v: "Málaga, Spain" },
                    { k: "Now",  v: "Dublin, Ireland" },
                    { k: "CS",   v: "2nd year, DCU" },
                  ].map(({ k, v }) => (
                    <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(170,95,20,0.5)", minWidth: 28 }}>{k}</span>
                      <span style={{ fontSize: 13, color: "#5a4030" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* languages */}
              <div style={{
                padding: "14px 18px",
                background: "rgba(215,145,40,0.1)", backdropFilter: "blur(10px)",
                borderRadius: 14, border: "1px solid rgba(210,150,50,0.22)",
              }}>
                <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(160,90,20,0.55)", marginBottom: 8 }}>Languages</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["🇪🇸","ES"],["🇬🇧","EN"],["🇫🇷","FR"]].map(([flag, code]) => (
                    <span key={code} style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 12, padding: "4px 10px", borderRadius: 20,
                      background: "rgba(255,253,248,0.82)",
                      border: "1px solid rgba(210,155,55,0.28)",
                      color: "#5a4030",
                    }}><span style={{ fontSize: 14 }}>{flag}</span>{code}</span>
                  ))}
                </div>
                <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(160,90,20,0.4)", marginTop: 7 }}>all native</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── STORY + CODING ──────────────────────────────────── */}
        <Reveal delay={0.05}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[
              {
                label: "The story",
                text: "Grew up in Málaga, went to a French school. Moved to England at seven — English became part of me. Madrid at twelve. A few months in Paris. Now Dublin for CS.",
              },
              {
                label: "How coding started",
                text: "First computer I just wanted to know what it could do. Python at twelve. Then HTML, then everything else. My only advice: just fidget with it.",
              },
            ].map(({ label, text }) => (
              <div key={label} style={{
                padding: "22px 24px",
                background: "rgba(255,253,248,0.84)", backdropFilter: "blur(14px)",
                borderRadius: 16, border: "1px solid rgba(210,150,50,0.14)",
              }}>
                <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(170,95,20,0.5)", marginBottom: 10 }}>{label}</div>
                <p style={{ fontSize: 14, lineHeight: 1.78, color: "#5a4030", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── OUTSIDE CODE ────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14,
          }}>
            <div style={{
              padding: "22px 24px",
              background: "rgba(255,253,248,0.84)", backdropFilter: "blur(14px)",
              borderRadius: 16, border: "1px solid rgba(210,150,50,0.14)",
            }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(170,95,20,0.5)", marginBottom: 12 }}>Outside code</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {["Tennis daily", "Gym daily", "Piano", "Guitar", "Ukulele", "Drums"].map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: "4px 11px", borderRadius: 20,
                    background: "rgba(215,145,40,0.1)", border: "1px solid rgba(210,150,50,0.2)",
                    color: "#5a4020",
                  }}>{t}</span>
                ))}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "#7a6248", margin: 0 }}>
                Tennis I would play every day for the rest of my life. I compose too, have my own music made with software. Both music and code are about building something from nothing.
              </p>
            </div>
            <Photo alt="Life" style={{ minHeight: 220 }} />
          </div>
        </Reveal>

        {/* ── AI TAKE — dark card ──────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            padding: "26px 28px", marginBottom: 14,
            background: "rgba(18,10,3,0.87)", backdropFilter: "blur(18px)",
            borderRadius: 18, border: "1px solid rgba(220,140,40,0.14)",
          }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(220,140,40,0.45)", marginBottom: 12 }}>
              An honest take
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.76, color: "rgba(248,242,232,0.72)", margin: 0 }}>
              AI is just the next layer of abstraction. Assembly, then C, then Python, now this. We adapt and go further. What I actually think: in a few years websites won't be browsed by people. They will be endpoints for AI agents. No hero sections, no animations. Just structure and speed. I find that exciting.
            </p>
          </div>
        </Reveal>

        {/* ── PITCH CTA ───────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            padding: "28px 30px", marginBottom: 14,
            background: "linear-gradient(135deg, rgba(205,125,30,0.13) 0%, rgba(220,165,45,0.07) 100%)",
            backdropFilter: "blur(14px)",
            borderRadius: 20,
            border: "1px solid rgba(205,125,30,0.28)",
          }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(170,95,20,0.55)", marginBottom: 10 }}>The adventure</div>
            <h2 style={{
              fontFamily: "var(--font-instrument)", fontSize: "clamp(1.35rem, 4vw, 1.8rem)",
              lineHeight: 1.2, letterSpacing: "-0.015em", color: "#1a1008",
              margin: "0 0 12px", fontWeight: 400,
            }}>
              Building Pitch. Join if you want.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#5a4020", marginBottom: 20 }}>
              A networking platform for founders and investors. Something premium that people actually need. If you want to help build it, reach out. No formalities.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Email", value: "eugeniobrb@icloud.com", href: "mailto:eugeniobrb@icloud.com" },
                { label: "WhatsApp", value: "+34 697 476 663", href: "https://wa.me/34697476663" },
              ].map(({ label, value, href }) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", gap: 5,
                    padding: "14px 16px", borderRadius: 12, textDecoration: "none",
                    background: "rgba(255,253,248,0.78)", border: "1px solid rgba(205,145,45,0.22)",
                    transition: "border-color 0.18s, background 0.18s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(205,125,30,0.5)";
                    el.style.background = "rgba(255,253,248,0.95)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(205,145,45,0.22)";
                    el.style.background = "rgba(255,253,248,0.78)";
                  }}
                >
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(160,90,20,0.5)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "#3a2808" }}>{value}</span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── SIGN OFF ────────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <div style={{
            textAlign: "center", paddingTop: 36, marginTop: 12,
            borderTop: "1px solid rgba(205,145,45,0.14)",
          }}>
            <p style={{
              fontFamily: "var(--font-instrument)", fontSize: "1.15rem",
              color: "rgba(90,64,32,0.5)", fontStyle: "italic", margin: "0 0 8px",
            }}>
              "Thanks for coming this far."
            </p>
            <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(160,100,30,0.4)", marginBottom: 24 }}>
              — Eugenio
            </p>
            <Link href="/" style={{
              fontSize: 11, fontFamily: "monospace", letterSpacing: "0.06em",
              color: "rgba(160,100,30,0.45)", textDecoration: "none",
            }}>
              ← back to the portfolio
            </Link>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
