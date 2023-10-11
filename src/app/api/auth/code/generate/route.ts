import connectToDatabase from "@/lib/connect-db";
import { hashCode, generateUniquePasscode } from "@/lib/utils";
import verificationToken from "@/models/verification-token";
import { NextRequest } from "next/server";
import { createTransport } from "nodemailer";

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams
    const domain = request.headers.get("host")?.split(".")[0] || "main";
    const email = searchParams.get('email')
    if (!email) {
        return 
    }
    const code = generateUniquePasscode()

    await connectToDatabase()

    /*
    await verificationToken.findOneAndDelete({
        domain,
        email
    })
    */

    await verificationToken.create({
        domain,
        email,
        code: hashCode(code),
        timestamp: Date.now() + 1000 * 60 * 5
    })

    const transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: +(process.env.EMAIL_PORT || 587),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Sign in to ${request.headers.get("host")}`,
            html: `
            Enter the following code in to the app.
            ${code}
            `,
        });

        return Response.json({})
    } catch (err: any) {
        return Response.json({}, { status: 500 })
    }
}
