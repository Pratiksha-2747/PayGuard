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

const withdraw = asyncHandler(async (req, res) => {
    const { amount } = req.body
    const userId = req.user._id

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Amount must be greater than zero")
    }

    const transaction = await Transaction.create({
        type: "withdraw",
        fromUserId: userId,
        amount,
        status: "pending"
    })

    const updatedWallet = await Wallet.findOneAndUpdate(
        { userId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true }
    )

    if (!updatedWallet) {
        transaction.status = "failed"
        transaction.failureReason = "Insufficient balance"
        transaction.completedAt = new Date()
        await transaction.save()

        throw new ApiError(400, "Insufficient balance")
    }

    transaction.status = "success"
    transaction.completedAt = new Date()
    await transaction.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { balance: updatedWallet.balance, transaction }, "Withdrawal successful"))
})

const transfer = asyncHandler(async (req, res) => {
    const { toUserId, amount, idempotencyKey } = req.body
    const fromUserId = req.user._id

    if (!toUserId || !amount || !idempotencyKey) {
        throw new ApiError(400, "toUserId, amount, and idempotencyKey are required")
    }

    if (amount <= 0) {
        throw new ApiError(400, "Amount must be greater than zero")
    }

    if (toUserId.toString() === fromUserId.toString()) {
        throw new ApiError(400, "Cannot transfer to yourself")
    }

    const existingTransaction = await Transaction.findOne({ idempotencyKey })

    if (existingTransaction) {
        return res
            .status(200)
            .json(new ApiResponse(200, { transaction: existingTransaction }, "Transaction already processed"))
    }

    const session = await Wallet.startSession()

    try {
        await session.withTransaction(async () => {
            const transaction = await Transaction.create([{
                type: "transfer",
                fromUserId,
                toUserId,
                amount,
                idempotencyKey,
                status: "pending"
            }], { session })

            const senderWallet = await Wallet.findOneAndUpdate(
                { userId: fromUserId, balance: { $gte: amount } },
                { $inc: { balance: -amount } },
                { new: true, session }
            )

            if (!senderWallet) {
                await Transaction.findByIdAndUpdate(
                    transaction[0]._id,
                    {
                        status: "failed",
                        failureReason: "Insufficient balance",
                        completedAt: new Date()
                    },
                    { session }
                )
                throw new Error("Insufficient balance")
            }

            await Wallet.findOneAndUpdate(
                { userId: toUserId },
                { $inc: { balance: amount } },
                { new: true, session }
            )

            await Transaction.findByIdAndUpdate(
                transaction[0]._id,
                {
                    status: "success",
                    completedAt: new Date()
                },
                { session }
            )
        })

        const finalTransaction = await Transaction.findOne({ idempotencyKey })

        return res
            .status(200)
            .json(new ApiResponse(200, { transaction: finalTransaction }, "Transfer successful"))
    } catch (error) {
        if (error.message === "Insufficient balance") {
            throw new ApiError(400, "Insufficient balance")
        }
        throw error
    } finally {
        await session.endSession()
    }
})

export { deposit, withdraw, transfer }