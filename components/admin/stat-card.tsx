import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  href?: Route;
  /** Optional accent: "warning" for yellow, "danger" for red, "muted" for gray */
  accent?: "warning" | "danger" | "muted";
  /** "hero" renders a larger card for the top-row summary numbers */
  size?: "hero" | "default";
};

export function StatCard({ label, value, href, accent, size = "default" }: StatCardProps) {
  const accentClass =
    accent === "warning"
      ? "border-yellow-200 bg-yellow-50/50"
      : accent === "danger"
        ? "border-red-200 bg-red-50/50"
        : accent === "muted"
          ? "border-border bg-secondary/30"
          : "border-border bg-background";

  const inner = (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border p-5 transition-colors",
        size === "hero" ? "min-h-[110px]" : "min-h-[88px]",
        href && "cursor-pointer hover:bg-secondary/40",
        accentClass
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "tabular-nums font-semibold",
          size === "hero" ? "text-4xl" : "text-3xl"
        )}
      >
        {value}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
}
