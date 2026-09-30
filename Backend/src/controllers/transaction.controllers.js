import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Wallet } from "../models/wallet.model.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";

const deposit = asyncHandler(async (req, res) => {
    const { amount } = req.body
    const userId = req.user._id

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Amount must be greater than zero")
    }

    const transaction = await Transaction.create({
        type: "deposit",
        toUserId: userId,
        amount,
        status: "pending"
    })

    const updatedWallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } },
        { new: true, upsert: true } 
    )

    transaction.status = "success"
    transaction.completedAt = new Date()
    await transaction.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { balance: updatedWallet.balance, transaction }, "Deposit successful"))
})

export { deposit }