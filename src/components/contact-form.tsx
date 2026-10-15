"use client";

import { useState } from "react";

import { SITE } from "@/config/site";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type FormState = {
  status: "idle" | "ready" | "error";
  message: string;
};

const TOPICS = [
  "Pre-purchase question",
  "Product / sample question",
  "Purchase or delivery issue",
  "Refund request",
  "Something else",
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !emailValid || message.trim().length < 10) {
      sound.close();
      setState({
        status: "error",
        message:
          "Please add your name, a valid email address, and a message of at least a few words.",
      });
      return;
    }

    const subject = `[${topic}] Message from ${name.trim()}`;
    const body = [
      message.trim(),
      "",
      "———",
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Topic: ${topic}`,
    ].join("\n");

    const mailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    sound.success();
    setState({
      status: "ready",
      message: `Your email app should now open with the message ready to send to ${SITE.contactEmail}. If nothing opened, copy your message and email us directly.`,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="text-sm font-semibold text-ink"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-[15px] text-ink transition-colors placeholder:text-muted/60 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="text-sm font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={email.length > 0 && !emailValid}
            className={cn(
              "w-full rounded-xl border bg-paper-raised px-4 py-3 text-[15px] text-ink transition-colors placeholder:text-muted/60 hover:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/20",
              email.length > 0 && !emailValid
                ? "border-red-400"
                : "border-line focus:border-accent",
            )}
            placeholder="you@studio.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-topic"
          className="text-sm font-semibold text-ink"
        >
          Topic
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="w-full appearance-none rounded-xl border border-line bg-paper-raised bg-[length:14px] bg-[right_1rem_center] bg-no-repeat px-4 py-3 pr-11 text-[15px] text-ink transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3.5 5.25 7 8.75l3.5-3.5' stroke='%236b6558' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
          }}
        >
          {TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="text-sm font-semibold text-ink"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full resize-y rounded-xl border border-line bg-paper-raised px-4 py-3 text-[15px] leading-relaxed text-ink transition-colors placeholder:text-muted/60 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="How can we help? If your question is about a purchase, include your payment reference."
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="shimmer-btn inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-paper shadow-[0_1px_2px_rgb(25_23_19/0.2),0_12px_28px_-12px_rgb(25_23_19/0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0"
        >
          Open message in email app
        </button>
        <p className="text-xs leading-relaxed text-muted">
          This form opens your default email app addressed to{" "}
          <span className="font-medium text-ink-soft">{SITE.contactEmail}</span>
          . Nothing is stored on this site.
        </p>
      </div>

      {state.message && (
        <div
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl border p-4 text-sm leading-relaxed",
            state.status === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-line bg-paper-raised text-ink-soft",
          )}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
