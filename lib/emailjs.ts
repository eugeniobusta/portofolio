import emailjs from "@emailjs/browser";

export interface ContactFormData {
  from_name: string;
  from_email: string;
  message: string;
}

/*
 * Reads configuration from environment variables.
 * NEXT_PUBLIC_ prefix = available in the browser bundle.
 * EmailJS public keys are intentionally public-facing — the service
 * restricts senders by domain, not by keeping the key secret.
 */
const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "";

export async function sendEmail(data: ContactFormData): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error(
      "EmailJS is not configured. Add NEXT_PUBLIC_EMAILJS_* variables to .env.local"
    );
  }

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, data as unknown as Record<string, unknown>, { publicKey: PUBLIC_KEY });
}
