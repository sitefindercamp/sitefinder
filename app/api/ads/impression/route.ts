import { NextRequest, NextResponse } from "next/server";
import { incrementImpressions } from "@/lib/ad-campaigns";

// POST /api/ads/impression
// Body: { campaignIds: string[] }
// Called by the ImpressionTracker client component on page load.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const campaignIds =
    body &&
    typeof body === "object" &&
    "campaignIds" in body &&
    Array.isArray((body as Record<string, unknown>).campaignIds)
      ? ((body as Record<string, unknown>).campaignIds as unknown[])
          .filter((id): id is string => typeof id === "string")
          .slice(0, 20) // cap to prevent abuse
      : [];

  if (campaignIds.length === 0) {
    return NextResponse.json({ ok: true });
  }

  try {
    await incrementImpressions(campaignIds);
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true });
}
