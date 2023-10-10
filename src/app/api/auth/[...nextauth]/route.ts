import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import EmailProvider from 'next-auth/providers/email';
import { createTransport } from 'nodemailer';

const adapter = MongoDBAdapter(clientPromise)

export const authOptions: NextAuthOptions = {
    providers: [
        EmailProvider({
            maxAge: 5 * 60,
            async generateVerificationToken() {
                return "rajat"
            },
            async sendVerificationRequest({ 
                identifier,
                url,
                token,
                provider
            }) {
                //console.log(identifier, url, token, provider)
                const theme = {}
                const { host } = new URL(url)
                const transport = createTransport(provider.server)
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ token, host }),
                    html: html({ token, host, theme }),
                })
                const failed = result.rejected.concat(result.pending).filter(Boolean)
                if (failed.length) {
                    throw new Error(`Email (${failed.join(", ")}) could not be sent`)
                }
            },
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        })
    ],
    adapter: adapter,
    pages: {
        signIn: '/api/auth/sign-in'
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log('signIn', user, account, profile, email, credentials)
            return true
        }
    }
}

const handler = NextAuth(authOptions)

function html(params: { token: string; host: string; theme: Theme }) {
  const { token, host, theme } = params

  const escapedHost = host.replace(/\./g, "&#8203;.")

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const brandColor = theme.brandColor || "#346df1"
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const buttonText = theme.buttonText || "#fff"

  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  }

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                <p>Login code</p>
                <p>${token}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`
}

export { handler as GET, handler as POST }
