import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Wallet } from "../models/wallet.model.js";
import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
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

const toggleUserActive = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "Cannot deactivate your own account")
    }

    user.isActive = !user.isActive
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`))
})

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await User.find()
        .select("_id username email fullName role isActive createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    const total = await User.countDocuments()

    return res
        .status(200)
        .json(new ApiResponse(200, {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Users retrieved successfully"))
})

export { getTotalBalance, getFailedTransactions, toggleUserActive, getAllUsers }
