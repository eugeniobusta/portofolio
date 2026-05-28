import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

/*
 * next/font/google downloads these fonts at BUILD TIME and serves them from
 * your own domain. Zero runtime latency, zero privacy leaks to Google.
 *
 * Each font gets a `variable` CSS custom property name.
 * We pass those variables to <html> so the whole page can use them.
 * The @theme block in globals.css then maps them to Tailwind utilities.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

/*
 * metadata: Next.js uses this to generate <title>, <meta description>,
 * and Open Graph tags (the preview card when you share the link on LinkedIn).
 */
export const metadata: Metadata = {
  title: {
    default: "Eugenio Bustamante",
    template: "%s | Eugenio Bustamante",
  },
  description:
    "CS student in Dublin building software, mostly things with AI in them. Projects, ideas, and a 3D world to drive around.",
  keywords: ["Eugenio Bustamante", "portfolio", "CS student", "software developer", "React", "Python", "Dublin"],
  authors: [{ name: "Eugenio Bustamante" }],
  creator: "Eugenio Bustamante",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Eugenio Bustamante",
    description:
      "CS student in Dublin building software, mostly things with AI in them.",
    siteName: "Eugenio Bustamante",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eugenio Bustamante",
    description:
      "CS student in Dublin building software, mostly things with AI in them.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} scroll-smooth antialiased`}
    >
      <body className="bg-paper text-ink min-h-screen">{children}</body>
    </html>
  );
}
