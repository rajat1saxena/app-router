"use client"

import { useEffect, useState } from 'react'
import styles from './NavMenu.module.css'
import { supabase } from '@/lib/supabase'

function AuthButton() {
    const [session, setSession] = useState<any>()
    useEffect(() => {
        checkSession()
    }, [])

    const checkSession = async function () {
        const { data: {session: sessionLocal}, error } = await supabase.auth.getSession()
        if (sessionLocal) {
            setSession(sessionLocal)
        }
        console.log(session, error);
    }

    if (session) {
        return (
            <div className={styles.navbar}>
                {(session?.user as any)?.email} <br />
                <button onClick={() => {}}>Sign out</button>
            </div>
        )
    }
    return (
        <div className={styles.navbar}>
            Guest <br />
            <button onClick={() => {}}>Sign in</button>
        </div>
    )
}

export default function NavMenu() {
    return (
        <div>
            <AuthButton />
        </div>
    )
}
