import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials"
import VerificationToken from "@/models/verification-token";
import { hashCode } from "@/lib/utils";
import User from "@/models/User";
import connectToDatabase from "@/lib/connect-db";

export const authOptions: NextAuthOptions = {
        providers: [
            CredentialsProvider({
                name: "Email",
                credentials: {},
                async authorize(credentials, req) {
                    const { email, code } = credentials
                    const domain = req.headers?.host?.split(".")[0] || "main";

                    await connectToDatabase()

                    const verificationToken = await VerificationToken.findOneAndDelete({
                        email,
                        domain,
                        code: hashCode(code),
                        timestamp: { $gt: Date.now() }
                    })
                    console.log("verificationToken", verificationToken)
                    if (!verificationToken) {
                        return null
                    }

                    let user = await User.findOne({
                        domain,
                        email
                    })

                    if (!user) {
                        user = await User.create({
                            domain,
                            email
                        })
                    }
                    console.log(user)

                    return {
                        id: user.userId,
                        email,
                        name: user.name
                    }
                }
            })
        ],
        pages: {
            signIn: '/api/auth/sign-in'
        },
        callbacks: {
            async redirect({ url, baseUrl }) {
                return url;
            }
        }
}

const generateAuthOptions = (domain: string, host?: string): NextAuthOptions  => ({
        providers: [
            CredentialsProvider({
                name: "Email",
                credentials: {},
                async authorize(credentials, req) {
                    console.log("credentials", credentials)
                    const { email, code, callbackUrl } = credentials
                    console.log(callbackUrl)
                    const domain = req.headers?.host?.split(".")[0] || "main";
                    console.log(email, code, domain)
                    await connectToDatabase()
                    const verificationToken = await VerificationToken.findOneAndDelete({
                        email,
                        domain,
                        code: hashCode(code),
                        timestamp: { $gt: Date.now() }
                    })
                    console.log("verificationToken", verificationToken)
                    if (!verificationToken) {
                        console.log("returning...")
                        return null
                    }

                    let user = await User.findOne({
                        domain,
                        email
                    })

                    if (!user) {
                        user = await User.create({
                            domain,
                            email
                        })
                    }
                    console.log(user)

                    return {
                        id: user.userId,
                        email,
                        name: user.name
                    }
                }
            })
        ],
        pages: {
            signIn: '/api/auth/sign-in'
        },
        callbacks: {
            async redirect({ url, baseUrl }) {
                return url;
            }
        }
})

//const handler = NextAuth(authOptions)
async function auth(req: Request, res: Response) {
    return await NextAuth(req, res, authOptions)
}
export { auth as GET, auth as POST }

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

