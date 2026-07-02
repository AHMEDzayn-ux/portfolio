import { NextResponse } from "next/server";
import { getProfile } from "@/lib/data/queries";

/**
 * Proxies the resume file from storage with a Content-Disposition:
 * attachment header, so the browser downloads it as a PDF instead of
 * navigating to the (cross-origin) storage URL.
 */
export async function GET() {
  const profile = await getProfile();

  if (!profile.resume_url) {
    return NextResponse.json({ error: "No resume available" }, { status: 404 });
  }

  const upstream = await fetch(profile.resume_url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 502 }
    );
  }

  const filename = `${profile.full_name.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "resume"}-Resume.pdf`;

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
