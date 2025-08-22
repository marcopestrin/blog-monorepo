import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  if (!secret || secret !== process.env.PREVIEW_SECRET) {
    return new NextResponse("Invalid secret", { status: 401 });
  }
  draftMode().enable();
  const redirectUrl = slug ? `/blog/${slug}` : "/blog";
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
