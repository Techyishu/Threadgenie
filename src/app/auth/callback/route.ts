import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
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
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      // Add a small delay to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.redirect(new URL(next, origin))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/?error=auth_callback_failed', origin))
    }
  }

  return NextResponse.redirect(new URL('/', origin))
}