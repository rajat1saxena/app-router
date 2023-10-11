import mongoose from "mongoose";

export interface Session {
    _id: mongoose.Types.ObjectId;
    userId: string;
    domain: string;
    expires: Date;
    sessionToken: string;
}

const SessionSchema = new mongoose.Schema<Session>(
    {
        domain: { type: String, required: true },
        userId: { type: String, required: true },
        sessionToken: { type: String, required: true },
        expires: { type: Date, required: true }
    }
);

SessionSchema.index(
    {
        domain: 1,
        userId: 1,
    },
    { unique: true },
);

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
