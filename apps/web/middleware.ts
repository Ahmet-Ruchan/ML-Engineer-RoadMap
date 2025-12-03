import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { locales } from './i18n'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Don't use a prefix for the default locale
  localePrefix: 'as-needed',
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /admin to /en/admin (or user's preferred locale)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const locale = 'en' // Default to English, can be enhanced with user preference
    const adminPath = pathname === '/admin' ? '/admin' : pathname.replace('/admin', '/admin')
    return NextResponse.redirect(new URL(`/${locale}${adminPath}`, request.url))
  }

  // Handle i18n routing first
  const response = intlMiddleware(request)

  // Get session token
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
  })

  // Extract locale from pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameHasLocale 
    ? pathname.split('/')[1] 
    : 'en'
  const pathWithoutLocale = pathnameHasLocale 
    ? pathname.slice(`/${locale}`.length) || '/' 
    : pathname

  // Protected routes (require authentication)
  const protectedRoutes = ['/dashboard', '/profile', '/bookmarks', '/badges']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  )

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes (require admin role)
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register']
  if (authRoutes.some(route => pathWithoutLocale.startsWith(route)) && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return response
}

export const config = {
  // Match all pathnames except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
