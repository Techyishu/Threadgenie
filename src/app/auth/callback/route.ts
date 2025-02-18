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
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      // Return a 302 redirect with auth cookies
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      // Copy over the auth cookies from supabase response
      const authCookies = cookieStore.getAll()
      authCookies.forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
      })

      return response
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 