import { NextRequest, NextResponse } from "next/server";
import { incrementClick } from "@/lib/ad-campaigns";

// GET /api/ads/click?id=CAMPAIGN_ID&to=TARGET_URL
// Increments click count then redirects the user.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const to = searchParams.get("to");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Fire-and-forget — don't block the redirect on a DB error
  try {
    await incrementClick(id);
  } catch {
    // best-effort
  }

  if (to) {
    // Validate it's a real URL before redirecting
    try {
      const url = new URL(to);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return NextResponse.redirect(url.toString());
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.json({ ok: true });
}
