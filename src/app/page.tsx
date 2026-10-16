import { Logo } from "@/components/logo";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <Logo />
      <p className="text-sm text-neutral-500">New product coming soon — ₹299</p>
    </main>
  );
}
