import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAllProfiles, countProfilesByRole } from "@/lib/profiles";
import type { UserRole } from "@/lib/profiles";
import { setUserRoleAction } from "./actions";
import { DeleteUserButton } from "./delete-user-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<UserRole, string> = {
  admin:      "bg-purple-100 text-purple-800 border-purple-200",
  owner:      "bg-green-100  text-green-800  border-green-200",
  user:       "bg-gray-100   text-gray-700   border-gray-200",
  advertiser: "bg-blue-100   text-blue-800   border-blue-200",
};

const ALL_ROLES: UserRole[] = ["admin", "owner", "user", "advertiser"];

const FILTERS: Array<{ label: string; value: UserRole | "all" }> = [
  { label: "All",        value: "all" },
  { label: "Admins",     value: "admin" },
  { label: "Owners",     value: "owner" },
  { label: "Users",      value: "user" },
  { label: "Advertisers",value: "advertiser" },
];

function UserInitial({ email }: { email: string }) {
  const letter = email?.[0]?.toUpperCase() ?? "?";
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
      {letter}
    </span>
  );
}

async function UsersListContent({
  role,
  success,
  error,
}: {
  role: UserRole | undefined;
  success: string | null;
  error: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [profiles, counts] = await Promise.all([
    listAllProfiles(role),
    countProfilesByRole(),
  ]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Management</p>
        <h1 className="mt-2 text-3xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} registered user{total !== 1 ? "s" : ""} · manage roles below.
        </p>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href =
            filter.value === "all"
              ? ("/admin/users" as Route)
              : (`/admin/users?role=${filter.value}` as Route);
          const active = filter.value === "all" ? !role : filter.value === role;
          const count = filter.value !== "all" ? counts[filter.value as UserRole] : null;

          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {filter.label}
              {count != null && count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Alerts */}
      {success && (
        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {decodeURIComponent(success)}
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}

      {/* User rows */}
      {profiles.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          {profiles.map((profile, i) => (
            <div
              key={profile.id}
              className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                i !== profiles.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <UserInitial email={profile.email} />

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/users/${profile.id}` as Route}
                  className="truncate text-sm font-medium hover:text-primary hover:underline"
                >
                  {profile.email}
                </Link>
                <p className="text-xs text-muted-foreground">Joined {formatDate(profile.created_at)}</p>
              </div>

              <Badge variant="outline" className={ROLE_COLORS[profile.role]}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>

              <form action={setUserRoleAction} className="flex items-center gap-2">
                <input type="hidden" name="user_id" value={profile.id} />
                <select
                  name="role"
                  defaultValue={profile.role}
                  className="rounded-lg border border-input bg-background px-2.5 py-1 text-sm"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
              </form>

              {/* Delete button — hidden for own account */}
              {profile.id !== currentUser?.id && (
                <DeleteUserButton userId={profile.id} email={profile.email} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No {role ? `${role}s` : "users"} found.
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "Users | Admin",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const roleParam = typeof params.role === "string" ? params.role : undefined;
  const role = ALL_ROLES.includes(roleParam as UserRole) ? (roleParam as UserRole) : undefined;
  const success = typeof params.success === "string" ? params.success : null;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <UsersListContent role={role} success={success} error={error} />
    </Suspense>
  );
}
