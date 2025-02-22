import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          }
        }
      }
    )

    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError

      // Get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) throw new Error('No session established')

      // Create response with redirect
      const response = NextResponse.redirect(new URL('/dashboard', origin))

      // Set cookie options
      const cookieOptions: CookieOptions = {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: request.headers.get('host')?.split(':')[0] // Remove port if present
      }

      // Set the cookies
      response.cookies.set('sb-access-token', session.access_token, cookieOptions)

      if (session.refresh_token) {
        response.cookies.set('sb-refresh-token', session.refresh_token, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 365 // 1 year
        })
      }

      // Set additional auth cookie
      response.cookies.set('supabase-auth-token', 
        JSON.stringify([session.access_token, session.refresh_token]),
        cookieOptions
      )

      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      // Redirect to login page with error
      return NextResponse.redirect(
        new URL(`/?error=auth_callback_failed&message=${error}`, origin)
      )
    }
  }

  // No code present, redirect to home page
  return NextResponse.redirect(new URL('/', origin))
}