import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Skip middleware for API routes and public assets
  if (
    requestUrl.pathname.startsWith('/api') || 
    requestUrl.pathname.startsWith('/_next') ||
    requestUrl.pathname.startsWith('/favicon.ico') ||
    requestUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Create a response to modify
  let response = NextResponse.next()

  // Create a Supabase client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // This is used for setting cookies in the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // This is used for removing cookies in the response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if the user is authenticated
  const { data: { session }, error } = await supabase.auth.getSession()

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings', '/profile', '/generate-thread']
  const isProtectedRoute = protectedRoutes.some(route => 
    requestUrl.pathname === route || requestUrl.pathname.startsWith(route)
  )

  // Handle authentication logic
  if (!session && isProtectedRoute) {
    // User is not authenticated and trying to access a protected route
    // Redirect to home page with a query parameter to show the auth modal
    return NextResponse.redirect(new URL('/?auth=signin', request.url))
  }

  // Continue with the request
  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}