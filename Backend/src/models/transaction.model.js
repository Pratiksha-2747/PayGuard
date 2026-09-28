import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const transactionSchema = new Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4
    },
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true 
    },
    type: {
        type: String,
        enum: ["deposit", "withdraw", "transfer"],
        required: true
    },
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, "Amount must be greater than zero"]
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },
    failureReason: {
        type: String
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true })

export const Transaction = mongoose.model("Transaction", transactionSchema)