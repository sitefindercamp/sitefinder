"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteNavLinkProps = {
  href: Route;
  label: string;
};

function isActivePath(pathname: string, href: Route) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavLink({ href, label }: SiteNavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 pb-1 text-sm font-semibold hover:text-white ${
        active ? "border-[#e5d960] text-white" : "border-transparent text-white/72"
      }`}
    >
      {label}
    </Link>
  );
}

