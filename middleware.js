import { NextResponse } from "next/server";

export function middleware(request) {
  const host = request.headers.get("host") || "";

  if (host.startsWith("campaign.sivaah.in")) {
    const url = request.nextUrl.clone();

    if (url.pathname === "/") {
      url.pathname = "/campaign";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}