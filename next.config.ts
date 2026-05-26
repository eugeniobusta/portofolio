import type { NextConfig } from "next";

const securityHeaders = [
  /*
   * Stops browsers from guessing a file's MIME type.
   * Prevents a class of attack where a malicious file is served
   * with the wrong Content-Type header.
   */
  { key: "X-Content-Type-Options",    value: "nosniff" },

  /*
   * Prevents your site from being embedded in an <iframe> on another domain.
   * Blocks "clickjacking" — where an attacker overlays an invisible frame
   * over a legitimate button to steal clicks.
   */
  { key: "X-Frame-Options",           value: "DENY" },

  /*
   * Controls how much URL information is sent in the Referer header
   * when a user navigates away from your site via a link.
   * "strict-origin-when-cross-origin" is the modern safe default.
   */
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },

  /*
   * Disables browser features you don't use.
   * This signals to security reviewers (and users) that you're not
   * secretly accessing their camera, mic, or location.
   */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },

  /*
   * Forces HTTPS for 1 year after first visit. Includes subdomains.
   * preload: ask browsers to load the HTTPS-only version before any request.
   */
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",   /* applies to every route */
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
