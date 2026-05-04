import { isAdminEmail } from "@/lib/auth-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserIsAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as string | undefined) ?? undefined;
  const isAdmin = role === "admin" || (!role && isAdminEmail(user.email));

  return { user, isAdmin };
}
