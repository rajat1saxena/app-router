"use client"

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

const signinErrors: Record<
  Lowercase<any>,
  string
> = {
  default: "Unable to sign in.",
  signin: "Try signing in with a different account.",
  oauthsignin: "Try signing in with a different account.",
  oauthcallbackerror: "Try signing in with a different account.",
  oauthcreateaccount: "Try signing in with a different account.",
  emailcreateaccount: "Try signing in with a different account.",
  callback: "Try signing in with a different account.",
  oauthaccountnotlinked:
    "To confirm your identity, sign in with the same account you used originally.",
  emailsignin: "The e-mail could not be sent.",
  credentialssignin:
    "Sign in failed. Check the details you provided are correct.",
  sessionrequired: "Please sign in to access this page.",
}

export default function SignIn(props) {
    const {
        csrfToken,
        providers = {},
        callbackUrl,
        email: userEmail,
        error: errorType
    } = props
    const [showCode, setShowCode] = useState(false)
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const searchParams = useSearchParams()
    const callbackUrlValue = searchParams.get('callbackUrl')

    const error =
        errorType &&
        (signinErrors[errorType.toLowerCase() as Lowercase<any>] ??
          signinErrors.default)

    const checkToken = function (e: FormEvent) {
        e.preventDefault()
        const url = `/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${code}${callbackUrlValue ? `&callbackUrl=${encodeURIComponent(callbackUrlValue)}` : ''}` 
        console.log(url)
        window.location.href = url 
    }

    return (
        <div>
            {error && (
              <div className="error">
                <p>{error}</p>
              </div>
            )}
            {!showCode &&
            <form onSubmit={(e) => e.preventDefault()}>
            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={async () => {
                const res = await signIn('email', {redirect: false, email })
                setShowCode(true)
            }}>Sign in</button>
            </form>
            }
            {showCode &&
                <form onSubmit={checkToken}>
                    Enter code sent to {email}
                    <input type='text' value={code} onChange={(e) => setCode(e.target.value)} />
                    <input type="submit" value="Login" />
                </form>}
        </div>
    )
}
