"use client";

import { useState, FormEvent } from "react";
import { TOKENS, CONTACT_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { DownloadCTA } from "@/components/cta/DownloadCTA";
import Link from "next/link";

interface ContactFormProps {
  variant?: "full" | "compact";
}

const inputClasses =
  "w-full rounded-lg border border-byki-medium-gray bg-white px-4 py-3 text-[15px] text-byki-black placeholder:text-byki-dark-gray/50 focus:border-byki-green focus:ring-2 focus:ring-byki-green/20 outline-none transition";

export function ContactForm({ variant = "full" }: ContactFormProps) {
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">(
    "email"
  );
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder — connect to backend/API later
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-byki-green/10 flex items-center justify-center text-byki-green text-2xl font-bold mb-4">
          ✓
        </div>
        <h3 className="text-xl font-bold text-byki-black mb-2">Thank you!</h3>
        <p className="text-byki-dark-gray mb-6">
          We&apos;ll get back to you within {TOKENS.RESPONSE_TIME}.
        </p>
        <p className="text-sm text-byki-dark-gray mb-4">In the meantime:</p>
        <DownloadCTA />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-byki-black mb-1.5">
          Name <span className="text-byki-dark-gray font-normal">(optional)</span>
        </label>
        <input type="text" placeholder="Your name" className={inputClasses} />
      </div>

      {/* Contact method */}
      <div>
        <label className="block text-sm font-semibold text-byki-black mb-1.5">
          How should we reach you?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-byki-black cursor-pointer">
            <input
              type="radio"
              name="contactMethod"
              value="email"
              checked={contactMethod === "email"}
              onChange={() => setContactMethod("email")}
              className="accent-byki-green"
            />
            <span>Email</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-byki-black cursor-pointer">
            <input
              type="radio"
              name="contactMethod"
              value="whatsapp"
              checked={contactMethod === "whatsapp"}
              onChange={() => setContactMethod("whatsapp")}
              className="accent-byki-green"
            />
            <span>WhatsApp</span>
          </label>
        </div>
      </div>

      {/* Email / WhatsApp input */}
      <div>
        <label className="block text-sm font-semibold text-byki-black mb-1.5">
          {contactMethod === "email" ? "Email address" : "WhatsApp number"}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type={contactMethod === "email" ? "email" : "tel"}
          placeholder={
            contactMethod === "email" ? "you@example.com" : "+60 12 345 6789"
          }
          required
          className={inputClasses}
        />
      </div>

      {/* Reason */}
      {variant === "full" && (
        <div>
          <label className="block text-sm font-semibold text-byki-black mb-1.5">
            Reason{" "}
            <span className="text-byki-dark-gray font-normal">(optional)</span>
          </label>
          <select className={inputClasses}>
            <option value="">Select a reason</option>
            {CONTACT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-byki-black mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          placeholder="How can we help?"
          className={inputClasses + " resize-none"}
        />
      </div>

      {/* PDPA Consent */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-byki-green"
          />
          <span className="text-sm text-byki-dark-gray leading-relaxed">
            {TOKENS.PDPA_CONSENT_TEXT}{" "}
            <Link href="/privacy" className="text-byki-green underline hover:text-byki-dark-green">
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" size="lg" disabled={!consent}>
        Send Message
      </Button>
    </form>
  );
}
