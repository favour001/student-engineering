import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // const accessToken = request.cookies.get('access_token')
  // const { pathname } = request.nextUrl

  // // 如果访问首页或 /home 路径，检查是否有 access_token
  // if (pathname === '/' || pathname.startsWith('/home')) {
  //   if (!accessToken) {
  //     // 没有 token，重定向到登录页
  //     const loginUrl = new URL('/login', request.url)
  //     return NextResponse.redirect(loginUrl)
  //   }
  // }

  // // 如果已登录用户访问登录页，重定向到首页
  // if (pathname === '/login' && accessToken) {
  //   const homeUrl = new URL('/', request.url)
  //   return NextResponse.redirect(homeUrl)
  // }

  // return NextResponse.next()
}

// 配置需要运行中间件的路径
export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/login',
  ],
}
