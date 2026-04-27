import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const { basePath, pathname } = request.nextUrl;
  const appPath = pathname;

  const buildRedirectUrl = (targetPath: string) => {
    const url = request.nextUrl.clone();

    url.pathname = targetPath;

    return url;
  };

  if (appPath === "/") {
    return NextResponse.redirect(buildRedirectUrl("/home"));
  }

  if (appPath.startsWith("/home") && !accessToken) {
    return NextResponse.redirect(buildRedirectUrl("/login"));
  }

  if (appPath === "/login" && accessToken) {
    return NextResponse.redirect(buildRedirectUrl("/home"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/login"],
};
