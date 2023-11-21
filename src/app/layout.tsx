import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SessionProvider from './components/SessionProvider'
import NavMenu from './components/NavMenu'
import SignIn from './components/SignIn'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <body className={inter.className}>
                    <main>
                        <NavMenu />
                        <SignIn />
                        {children}
                    </main>
        </body>
    </html>
  )
}
