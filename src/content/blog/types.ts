/**
 * Content blocks for the ClientFlow guides section.
 *
 * Articles are authored as typed data rather than MDX so the guides ship with
 * no extra build dependency and every block renders to real, crawlable HTML.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "callout"; title: string; text: string }
  | { kind: "template"; title: string; lines: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "cta"; text: string; label: string; href: string };

export type Article = {
  /** URL segment under /blog/. */
  slug: string;
  /** `<title>` before the site template is appended. */
  title: string;
  /** Visible page heading — the search intent, stated plainly. */
  h1: string;
  /** Meta description (target 140–160 characters). */
  description: string;
  /** One-line summary shown on the index and as the article standfirst. */
  summary: string;
  /** ISO date (YYYY-MM-DD) of first publication. */
  published: string;
  /** ISO date (YYYY-MM-DD) of the last substantive edit. */
  updated: string;
  /** Rough reading time, computed by hand to avoid shipping a word counter. */
  readingTime: string;
  /** Who this is for, used as an on-page meta line. */
  audience: string;
  /** Slugs of related guides, rendered as internal links. */
  related: string[];
  body: Block[];
};
