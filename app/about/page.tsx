export const metadata = { title: "About — Eugenio Bustamante", robots: { index: false, follow: false } };

export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "monospace",
      }}
    >
      <p style={{ color: "#222", fontSize: "13px", letterSpacing: "0.1em" }}>
        🐾 you found the corner
      </p>
      <p style={{ color: "#1a1a1a", fontSize: "11px" }}>coming soon</p>
      <a
        href="/"
        style={{ color: "#2a2a2a", fontSize: "11px", textDecoration: "none", marginTop: "8px" }}
      >
        ← back
      </a>
    </main>
  );
}
