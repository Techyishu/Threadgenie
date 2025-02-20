import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

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
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      // Get the session to ensure it's properly set
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session established')

      const response = NextResponse.redirect(new URL(next, origin))

      // Set auth cookies with proper options
      const cookieOptions: CookieOptions = {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      }

      if (session.access_token) {
        response.cookies.set('access-token', session.access_token, cookieOptions)
      }
      if (session.refresh_token) {
        response.cookies.set('refresh-token', session.refresh_token, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 365 // 1 year
        })
      }

      return response

    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/?error=auth_callback_failed', origin))
    }
  }

  // Return to home page if no code is present
  return NextResponse.redirect(new URL('/', origin))
}