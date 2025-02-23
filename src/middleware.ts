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
          // Properly remove cookies by setting maxAge to 0
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
    const { data: { session }, error } = await supabase.auth.getSession()

    // Clear all auth cookies if there's an error or no session
    if (error || !session) {
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token'
      ]
      cookiesToClear.forEach(name => {
        response.cookies.set({
          name,
          value: '',
          maxAge: 0,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true
        })
      })
    }

    // Handle auth callback route specially
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
      return response
    }

    // Handle API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
      return response
    }

    // If user is signed in and trying to access landing page
    if (session && request.nextUrl.pathname === '/landing') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    // Clear all auth cookies on error
    const errorResponse = NextResponse.redirect(new URL('/', request.url))
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token'
    ]
    cookiesToClear.forEach(name => {
      errorResponse.cookies.set({
        name,
        value: '',
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      })
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