import mongoose, {Schema} from "mongoose";

const  walletSchema = new Schema({

}, {timestamps: true})

export const Wallet = mongoose.model("Wallet", walletSchema)