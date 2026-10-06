import { asyncHandler } from "../utils/asyncHandler.js";
import { Wallet } from "../models/wallet.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getTotalBalance = asyncHandler(async (req, res) => {
    const result = await Wallet.aggregate([
        {
            $group: {
                _id: null,
                totalBalance: { $sum: "$balance" },
                totalWallets: { $sum: 1 }
            }
        }
    ])

    const totalBalance = result[0]?.totalBalance || 0
    const totalWallets = result[0]?.totalWallets || 0

    return res
        .status(200)
        .json(new ApiResponse(200, { totalBalance, totalWallets }, "Total balance retrieved successfully"))
})

const getFailedTransactions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const transactions = await Transaction.find({ status: "failed" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("fromUserId", "username email")
        .populate("toUserId", "username email")

    const total = await Transaction.countDocuments({ status: "failed" })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Failed transactions retrieved successfully"))
})

export { getTotalBalance, getFailedTransactions }
