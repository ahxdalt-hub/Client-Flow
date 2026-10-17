/** Tiny class combiner — pure module, safe from server & client components. */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
