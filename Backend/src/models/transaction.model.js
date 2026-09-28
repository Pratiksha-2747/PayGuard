import mongoose, {Schema} from "mongoose";

const  transactionSchema = new Schema({
    transactionId: {
        type: String
    },
    idempotentKey: {
        type: String
    }
}, {timestamps: true})

export const Transaction = mongoose.model("Transaction", transactionSchema)