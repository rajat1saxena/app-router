"use client"

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

function AuthButton() {
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const {data: session} = useSession()
    const [showCode, setShowCode] = useState(false)

    if (session) {
        return (
            <>
                {session?.user?.name} <br />
                <button onClick={() => signOut()}>Sign out</button>
            </>
        )
    }
    return (
        <>
            Guest <br />
            <button onClick={() => signIn()}>Sign in</button>
        </>
    )
}

export default function NavMenu() {
    return (
        <div>
            <AuthButton />
        </div>
    )
}
