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
      if (exchangeError) {
        // Handle rate limit error specifically
        if (exchangeError.status === 429) {
          console.error('Rate limit reached, waiting before retry')
          // Add a longer delay for rate limit
          await new Promise(resolve => setTimeout(resolve, 2000))
          return NextResponse.redirect(new URL('/auth/callback' + requestUrl.search, requestUrl.origin))
        }
        throw exchangeError
      }

      // Single session check instead of polling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session) {
        throw new Error('Failed to establish session')
      }

      // Reduced delay since we're not polling
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create response with the redirect
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      // Get all cookies including the newly set session cookies
      const authCookies = cookieStore.getAll()
      
      // Properly set all cookies on the response
      authCookies.forEach(cookie => {
        if (cookie.name.includes('supabase')) {
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
      // Add delay before redirecting on error to prevent rapid retries
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.redirect(new URL(`/?error=auth_callback_failed`, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 