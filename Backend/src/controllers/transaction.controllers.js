import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getMyTransactions = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const transactions = await Transaction.find({
        $or: [
            { fromUserId: userId },
            { toUserId: userId }
        ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("fromUserId", "username email")
    .populate("toUserId", "username email")

    const total = await Transaction.countDocuments({
        $or: [
            { fromUserId: userId },
            { toUserId: userId }
        ]
    })

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
        }, "Transactions retrieved successfully"))
})

export { getMyTransactions }
