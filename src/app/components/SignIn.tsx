"use client"

import { FormEvent, useEffect, useState } from 'react'
import styles from './SignIn.module.css'
import { supabase } from '@/lib/supabase'

export default function SignIn() {
    const [showCode, setShowCode] = useState(false)
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")

    useEffect(() => {
        checkSession()
    }, [])

    const checkSession = async function () {
        const { data, error } = await supabase.auth.getSession()
        console.log(data, error);
    }

    const checkToken = async function (e: FormEvent) {
        e.preventDefault()
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {},
        })
        if (data.hasOwnProperty('user')) {
            setShowCode(true)
        }
    }

    const signInUser = async function (e: FormEvent) {
        e.preventDefault()
        const response = await fetch('auth/confirm', {
            method: 'POST',
            body: JSON.stringify({
                email,
                code,
                type: 'email'
            })
        })
        console.log(response);
    }

    return (
        <div className={styles.content}>
            {!showCode &&
                <form onSubmit={checkToken}>
                    <input 
                        type='email' 
                        value={email} 
                        placeholder='Enter your email'
                        onChange={(e) => setEmail(e.target.value)} />
                    <input type="submit" value="Get code" />
                </form>
            }
            {showCode &&
                <form onSubmit={signInUser}>
                    Enter the code sent to {email}
                    <input type='text' value={code} onChange={(e) => setCode(e.target.value)} />
                    <input type="submit" value="Login" />
                </form>}
        </div>
    )
}
