"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CopyX,
  Upload,
  FileText,
  ClipboardCheck,
  Star,
  MessageSquare,
  Users,
  Megaphone,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

type NavGroup = {
  section: string;
  items: NavItem[];
};

export function AdminSidebarNav({
  pendingReviews,
  pendingClaims,
}: {
  pendingReviews: number;
  pendingClaims: number;
}) {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      section: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      section: "Content",
      items: [
        { href: "/admin/spas", label: "Spas", icon: Building2 },
        { href: "/admin/spas/new", label: "Add spa", icon: PlusCircle },
        { href: "/admin/blog", label: "Blog & Guides", icon: FileText },
        { href: "/admin/duplicates", label: "Duplicates", icon: CopyX },
        { href: "/admin/imports", label: "Imports", icon: Upload },
      ],
    },
    {
      section: "Moderation",
      items: [
        { href: "/admin/reviews", label: "Reviews", icon: Star, badge: pendingReviews },
        { href: "/admin/claims", label: "Claims", icon: ClipboardCheck, badge: pendingClaims },
        { href: "/admin/contact", label: "Contact", icon: MessageSquare },
      ],
    },
    {
      section: "People",
      items: [
        { href: "/admin/users", label: "Users", icon: Users },
      ],
    },
    {
      section: "Monetization",
      items: [
        { href: "/admin/ads", label: "Ad Campaigns", icon: Megaphone },
        { href: "/admin/advertising-leads", label: "Ad Leads", icon: TrendingUp },
      ],
    },
  ];

  const isActive = (href: Route) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href as string);
  };

  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.section}>
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            {group.section}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground/70")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold tabular-nums text-amber-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
