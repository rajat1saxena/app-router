import mongoose from "mongoose";
import { nanoid } from "nanoid";

export interface User {
    _id: mongoose.Types.ObjectId;
    domain: string;
    userId: string;
    email: string;
    active: boolean;
    name?: string;
    bio?: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
    subscribedToUpdates: boolean;
    image: string;
}

const UserSchema = new mongoose.Schema<User>(
    {
        domain: { type: String, required: true },
        userId: { type: String, required: true, default: () => nanoid() },
        name: { type: String, required: false },
        email: { type: String, required: true },
        active: { type: Boolean, required: true, default: true },
        bio: { type: String },
        permissions: [String],
        subscribedToUpdates: { type: Boolean, default: true },
        image: { type: String }
    },
    {
        timestamps: true,
    },
);

UserSchema.index({
    email: "text",
    name: "text",
});

UserSchema.index(
    {
        domain: 1,
        email: 1,
    },
    { unique: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
