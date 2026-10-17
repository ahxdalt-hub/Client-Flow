/**
 * Human-friendly order codes (e.g. `CF-7K2M9Q`).
 *
 * Shown to the buyer on their confirmation page so they can quote it in a
 * support or refund request, and mirrored into the payment gateway's metadata
 * so a refund can be cross-checked against the gateway record.
 *
 * The alphabet omits 0/O/1/I/L to avoid read-aloud ambiguity.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 6;

function randomCode(prefix: string): string {
  const bytes = new Uint8Array(LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${code}`;
}

export function generateOrderCode(): string {
  return randomCode("CF");
}

/** Support ticket reference, e.g. `CFT-7K2M9Q`. Quoted by the customer. */
export function generateTicketCode(): string {
  return randomCode("CFT");
}

/** True for a `CF-XXXXXX` code (case-insensitive). */
export function isOrderCode(value: string): boolean {
  return /^CF-[0-9A-Z]{4,10}$/.test(value.trim().toUpperCase());
}

/** Normalise user input to the stored form. */
export function normalizeOrderCode(value: string): string {
  return value.trim().toUpperCase();
}
