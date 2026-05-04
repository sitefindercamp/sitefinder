import { Mail, MessageSquare, Calendar } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InlineEmailLink } from "@/components/admin/inline-email-link";
import { DeleteContactButton } from "@/components/admin/delete-contact-button";

export const metadata = { title: "Contact Messages | Admin" };

// ── Types ─────────────────────────────────────────────────────────────────────

type Submission = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

type FilterValue = "all" | "week" | "with-subject";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function isThisWeek(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: "All",          value: "all" },
  { label: "This week",    value: "week" },
  { label: "Has subject",  value: "with-subject" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

type Props = {
  searchParams?: Promise<{ filter?: string }>;
};

export default async function AdminContactPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("id, name, email, subject, message, created_at")
    .order("created_at", { ascending: false });

  const all = (data ?? []) as Submission[];

  const params = await searchParams;
  const activeFilter = (params?.filter ?? "all") as FilterValue;

  const filtered = all.filter((m) => {
    if (activeFilter === "week")         return isThisWeek(m.created_at);
    if (activeFilter === "with-subject") return Boolean(m.subject);
    return true;
  });

  const thisWeekCount = all.filter((m) => isThisWeek(m.created_at)).length;

  return (
    <div className="grid gap-6">

      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Inbox</p>
        <h1 className="mt-2 text-3xl font-semibold">Contact messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages submitted via the public contact form.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: MessageSquare, label: "Total",     value: all.length },
          { icon: Calendar,      label: "This week", value: thisWeekCount },
          { icon: Mail,          label: "With subject",
            value: all.filter((m) => m.subject).length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ label, value }) => {
          const isActive = activeFilter === value;
          const count =
            value === "all"          ? all.length
            : value === "week"       ? thisWeekCount
            : all.filter((m) => m.subject).length;
          return (
            <a
              key={value}
              href={value === "all" ? "/admin/contact" : `/admin/contact?filter=${value}`}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              ].join(" ")}
            >
              {label}
              <span className={[
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground",
              ].join(" ")}>
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {/* Message list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No messages match this filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          {filtered.map((msg, i) => (
            <details
              key={msg.id}
              className={[
                "group",
                i !== filtered.length - 1 ? "border-b border-border" : "",
              ].join(" ")}
            >
              {/* Summary row — always visible, click to expand */}
              <summary className="flex cursor-pointer select-none list-none flex-wrap items-start justify-between gap-3 px-5 py-4 hover:bg-secondary/40 [&::-webkit-details-marker]:hidden">
                {/* Left: sender + subject */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-foreground">{msg.name}</span>
                    <InlineEmailLink email={msg.email} />
                  </div>
                  {msg.subject ? (
                    <p className="mt-0.5 text-sm text-foreground/80">{msg.subject}</p>
                  ) : (
                    <p className="mt-0.5 text-xs italic text-muted-foreground/60">No subject</p>
                  )}
                  {/* Message preview — hidden when open */}
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground group-open:hidden">
                    {msg.message}
                  </p>
                </div>

                {/* Right: date + time + chevron */}
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-foreground">{formatDate(msg.created_at)}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</p>
                  </div>
                  <svg
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                  >
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </summary>

              {/* Expanded body */}
              <div className="border-t border-border/60 px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {msg.message}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject ?? "Your message to KSpa.online")}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Mail className="size-3.5" />
                    Reply via email
                  </a>
                  <span className="text-xs text-muted-foreground">
                    Opens your mail client
                  </span>
                  <div className="ml-auto">
                    <DeleteContactButton id={msg.id} filter={activeFilter === "all" ? null : activeFilter} />
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
