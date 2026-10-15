import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact support",
  description: `Contact ${SITE.name} for pre-purchase questions, product questions, and purchase or delivery support.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted">
              <li>
                <Link href="/" className="transition-colors hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-ink">Contact</li>
            </ol>
          </nav>
          <p className="eyebrow">Support</p>
          <h1 className="display-title mt-3 text-[clamp(2rem,4.6vw,2.9rem)]">
            Get in touch
          </h1>
          <p className="mt-5 text-pretty text-[15px] leading-relaxed text-ink-soft">
            Questions about the pack, the sample, or a purchase — send a
            message and you&apos;ll hear back from the person who runs the
            store.
          </p>

          <dl className="mt-8 space-y-5 border-t border-line pt-8">
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-1.5">
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="break-all text-[15px] font-semibold text-accent underline underline-offset-4"
                >
                  {SITE.contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">What to include for purchase issues</dt>
              <dd className="mt-1.5 text-pretty text-sm leading-relaxed text-muted">
                Your payment reference or order ID, and the email address used
                at checkout. Never send full card numbers — we will never ask
                for them.
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Before you buy</dt>
              <dd className="mt-1.5 text-pretty text-sm leading-relaxed text-muted">
                Most product questions are answered on the{" "}
                <Link
                  href="/sample"
                  className="font-medium text-ink underline underline-offset-4"
                >
                  sample page
                </Link>{" "}
                and in the{" "}
                <Link
                  href="/#faq"
                  className="font-medium text-ink underline underline-offset-4"
                >
                  FAQ
                </Link>
                .
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={100} className="card-soft rounded-2xl p-6 md:p-8">
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
