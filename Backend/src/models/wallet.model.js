import mongoose, { Schema } from "mongoose";

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Balance cannot be negative"]
    },
    currency: {
        type: String,
        default: "INR",
        uppercase: true,
        trim: true
    }
}, { timestamps: true })

export const Wallet = mongoose.model("Wallet", walletSchema)