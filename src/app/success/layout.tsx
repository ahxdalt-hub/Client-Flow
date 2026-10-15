import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase confirmation",
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: "/success" },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
