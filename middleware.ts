import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default NextAuth(authConfig).auth

export function middleware(request: NextRequest) {
  const user = request.cookies.get('user')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPublicPath = request.nextUrl.pathname.startsWith('/_next') || 
                      request.nextUrl.pathname.startsWith('/api') ||
                      request.nextUrl.pathname.includes('.')

  // Skip middleware for public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If trying to access login page while already logged in
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If trying to access protected route while not logged in
  if (!isLoginPage && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/etablissement',
    '/test-notifications',
    '/((?!api|_next/static|_next/image|.*\\.png$).*)'
  ]
}
