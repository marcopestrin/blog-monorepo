import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*","/api/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const basicUser = process.env.ADMIN_BASIC_USER;
  const basicPass = process.env.ADMIN_BASIC_PASS;
  if (!basicUser || !basicPass) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" }
    });
  }
  const encoded = auth.split(" ")[1];
  const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");
  if (user !== basicUser || pass !== basicPass) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.next();
}
