import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Inter } from "next/font/google";

import { SITE } from "@/config/site";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { PageViewTracker } from "@/components/marketing/tracker";
import { InteractionSounds } from "@/components/marketing/interaction-sounds";
import { BuyBar } from "@/components/marketing/buy-bar";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const PRODUCT_DESCRIPTION =
  "A practical client acquisition toolkit for Indian freelancers and small agencies — 20 email templates, 10 DM scripts, 4 proposals and a lead tracker.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ClientFlow Outreach Kit — client acquisition templates for Indian freelancers",
    template: "%s · ClientFlow",
  },
  description:
    "Cold email templates, DM scripts, follow-up sequences, proposals and pricing tools for freelance designers, developers, marketers and agencies in India.",
  openGraph: {
    type: "website",
    siteName: "ClientFlow",
    title: "ClientFlow Outreach Kit",
    description: PRODUCT_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientFlow Outreach Kit",
    description: PRODUCT_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FBFAF7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Adds the `js` class before paint so motion styles only ever apply
          when JavaScript is running (content stays visible if JS fails).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="min-h-dvh bg-ivory text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-sm text-ivory focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <BuyBar />
        </Suspense>
        <InteractionSounds />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      </body>
    </html>
  );
}
