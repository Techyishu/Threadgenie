import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create the Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: name.includes('refresh') ? 60 * 60 * 24 * 365 : undefined
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            path: '/'
          })
        },
      },
    }
  )

  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    // Handle auth callback route specially
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
      return response
    }

    // Handle API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
      return response
    }

    // If user is not signed in and trying to access dashboard
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // If user is signed in and on the landing page
    if (session && request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    // Clear all auth cookies on error
    const errorResponse = NextResponse.redirect(new URL('/', request.url))
    const cookiesToClear = ['access-token', 'refresh-token', 'auth-token']
    cookiesToClear.forEach(name => {
      errorResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
    })
    return errorResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}