import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const homeUrl = new URL("/home", request.url);

    return NextResponse.redirect(homeUrl);
  }

  if (pathname.startsWith("/home") && !accessToken) {
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && accessToken) {
    const homeUrl = new URL("/home", request.url);

    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// 配置需要运行中间件的路径
export const config = {
  matcher: ["/", "/home/:path*", "/login"],
};
