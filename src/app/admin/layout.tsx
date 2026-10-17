import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AdminLogin } from "@/components/admin/login-form";
import { AdminNav } from "@/components/admin/nav";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isValidAdminCookie,
} from "@/lib/admin-auth";

export const instant = false;

export const metadata: Metadata = {
  title: "Store admin",
  robots: { index: false, follow: false },
};

/**
 * The admin shell. Auth is checked once here for every /admin route; when the
 * cookie is absent the login form is shown instead of any panel content.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = isValidAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <div className="border-b border-line">
        <div className="mx-auto max-w-md px-5 py-20 md:py-28">
          <p className="eyebrow">Owner</p>
          <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.4rem)] text-ink">
            Store admin
          </h1>
          <p className="mt-3 text-[0.9rem] text-muted">
            Private. Sign in with your admin key.
          </p>
          <div className="mt-8">
            <AdminLogin configured={isAdminConfigured()} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-ivory">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:gap-10 lg:px-10 lg:py-12">
        <AdminNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
