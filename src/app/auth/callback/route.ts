import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

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
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError

      // Explicitly wait for session to be established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session) {
        throw new Error('Failed to establish session')
      }

      // Add delay to ensure session is properly propagated
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create response with the redirect
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      // Get all cookies including the newly set session cookies
      const authCookies = cookieStore.getAll()
      
      // Properly set all cookies on the response
      authCookies.forEach(cookie => {
        if (cookie.name.includes('supabase')) {  // Only copy Supabase-related cookies
          response.cookies.set({
            name: cookie.name,
            value: cookie.value,
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
          })
        }
      })

      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      // On error, redirect to home page with error parameter
      return NextResponse.redirect(new URL(`/?error=auth_callback_failed`, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 