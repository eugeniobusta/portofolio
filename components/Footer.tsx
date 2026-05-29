"use client";

import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-frame">
      <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted font-mono">
          © {year} Eugenio Bustamante. Built simply, on purpose.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/eugeniobusta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink transition-colors duration-200"
            aria-label="GitHub"
          >
            <GithubLogo size={16} weight="bold" />
          </a>
          <a
            href="https://linkedin.com/in/eugenio-bustamante-4018522ba"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <LinkedinLogo size={16} weight="bold" />
          </a>
        </div>
      </div>
    </footer>
  );
}
