"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { PaperPlaneTilt, Check, Warning, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { sendEmail, type ContactFormData } from "@/lib/emailjs";

type FormStatus = "idle" | "sending" | "success" | "error";

const reveal = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 200, delay: i * 0.08 },
  }),
};

export default function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");

  /*
   * useForm returns helpers: register (connects input to form),
   * handleSubmit (wraps your submit logic with validation),
   * formState (holds errors, isSubmitting, etc.)
   */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setStatus("sending");
    try {
      await sendEmail(data);
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const inputClass = [
    "w-full px-4 py-3 rounded-lg text-sm text-ink bg-surface border border-frame",
    "placeholder:text-muted/60 font-sans",
    "focus:outline-none focus:border-frame-strong focus:ring-1 focus:ring-frame-strong",
    "transition-all duration-200",
  ].join(" ");

  const errorClass = "text-xs mt-1.5 font-mono";

  return (
    <section id="contact" className="section-pad border-t border-frame">
      <div className="container">

        <motion.div
          variants={reveal}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <span className="eyebrow mb-4 block">Get in touch</span>
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-ink">
            Let's talk.
          </h2>
          <p className="mt-4 text-base text-muted max-w-md leading-relaxed">
            Internships, collabs, or just want to say hi. I read everything and reply to everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-[3fr_2fr] gap-12 items-start">

          {/* Form column */}
          <motion.div
            variants={reveal}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {status === "success" ? (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-start gap-3 p-8 rounded-xl border border-frame"
                style={{ background: "var(--surface)" }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "var(--tag-green-bg)", color: "var(--tag-green-text)" }}
                >
                  <Check size={18} weight="bold" />
                </span>
                <div>
                  <p className="font-serif text-lg text-ink">Message sent.</p>
                  <p className="text-sm text-muted mt-1">
                    I'll get back to you within a day or two.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="from_name" className="block text-xs text-muted mb-1.5 font-medium uppercase tracking-wide">
                      Name
                    </label>
                    <input
                      id="from_name"
                      type="text"
                      placeholder="Your name"
                      className={inputClass}
                      aria-invalid={!!errors.from_name}
                      aria-describedby={errors.from_name ? "name-error" : undefined}
                      {...register("from_name", {
                        required: "Name is required",
                        minLength: { value: 2, message: "At least 2 characters" },
                      })}
                    />
                    {errors.from_name && (
                      <p id="name-error" className={errorClass} style={{ color: "var(--tag-red-text)" }} role="alert">
                        {errors.from_name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="from_email" className="block text-xs text-muted mb-1.5 font-medium uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      id="from_email"
                      type="email"
                      placeholder="you@example.com"
                      className={inputClass}
                      aria-invalid={!!errors.from_email}
                      aria-describedby={errors.from_email ? "email-error" : undefined}
                      {...register("from_email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />
                    {errors.from_email && (
                      <p id="email-error" className={errorClass} style={{ color: "var(--tag-red-text)" }} role="alert">
                        {errors.from_email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs text-muted mb-1.5 font-medium uppercase tracking-wide">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="What's on your mind?"
                    className={`${inputClass} resize-none`}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "msg-error" : undefined}
                    {...register("message", {
                      required: "Message is required",
                      minLength: { value: 10, message: "At least 10 characters" },
                      maxLength: { value: 2000, message: "Max 2000 characters" },
                    })}
                  />
                  {errors.message && (
                    <p id="msg-error" className={errorClass} style={{ color: "var(--tag-red-text)" }} role="alert">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Error banner */}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm p-3 rounded-lg"
                    style={{ background: "var(--tag-red-bg)", color: "var(--tag-red-text)" }}
                    role="alert"
                  >
                    <Warning size={15} weight="bold" />
                    Something went wrong. Please check your EmailJS setup or try again.
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm font-medium
                             hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed
                             active:scale-[0.98] transition-all duration-200"
                >
                  {status === "sending" ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-paper/30 border-t-paper animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <PaperPlaneTilt size={15} weight="bold" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info column */}
          <motion.div
            variants={reveal}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-6 md:sticky md:top-28"
          >
            <div>
              <div className="text-xs text-muted uppercase tracking-widest mb-3 font-medium">
                Direct email
              </div>
              <a
                href="mailto:eugeniobrb@icloud.com"
                className="text-sm text-ink hover:text-accent transition-colors duration-200 font-mono"
              >
                eugeniobrb@icloud.com
              </a>
            </div>

            <div className="divider" />

            <div>
              <div className="text-xs text-muted uppercase tracking-widest mb-3 font-medium">
                Elsewhere
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors duration-200"
                >
                  <GithubLogo size={15} weight="bold" />
                  GitHub
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors duration-200"
                >
                  <LinkedinLogo size={15} weight="bold" />
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="divider" />

            <p className="text-xs text-muted leading-relaxed font-mono">
              Response time: usually under 48h.
              <br />
              I'm based in Europe (CET).
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
