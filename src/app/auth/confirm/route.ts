import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json();
    const { email, type, code } = body;

  if (code && email && type) {
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
          },
        },
      }
    )

    /*
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    */
    const { error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type,
          })
    if (!error) {
        return Response.json({ success: true })
      //return NextResponse.redirect(next)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect('/')
}