import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/wallet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import JWT from "jsonwebtoken";
import { validatePasswordStrength } from "../utils/passwordValidator.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const register = asyncHandler(async (req, res) => {
    const { username, email, fullName, mobileNum, password } = req.body

    if (!username || !email || !fullName || !mobileNum || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const passwordValidation = validatePasswordStrength(password, username, email)
    if (!passwordValidation.isValid) {
        throw new ApiError(400, passwordValidation.errors.join(", "))
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }, { mobileNum }]
    })

    if (existingUser) {
        throw new ApiError(409, "User with this username, email or mobile number already exists")
    }

    const user = await User.create({
        username,
        email,
        fullName,
        mobileNum,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    await Wallet.create({
        userId: createdUser._id,
        balance: 0
    })

    const accessToken = createdUser.generateAccessToken()
    const refreshToken = createdUser.generateRefreshToken()

    createdUser.refreshToken = refreshToken
    await createdUser.save()

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, { user: createdUser, accessToken, refreshToken }, "User registered successfully"))
})

const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated. Contact support.")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save()

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"))
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = JWT.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const accessToken = user.generateAccessToken()
        const newRefreshToken = user.generateRefreshToken()

        user.refreshToken = newRefreshToken
        await user.save()

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

const getUserByIdentifier = asyncHandler(async (req, res) => {
    const { identifier } = req.params

    const user = await User.findOne({
        $or: [
            { username: identifier },
            { email: identifier }
        ]
    }).select("_id username email fullName")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User found"))
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "If the email exists, a reset link has been sent"))
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = await bcrypt.hash(resetToken, 10)

    user.passwordResetToken = hashedToken
    user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password/${resetToken}`

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: "Password Reset Request",
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset for your PayGuard account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error("Error sending email:", error)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "If the email exists, a reset link has been sent"))
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const users = await User.find({
        passwordResetToken: { $exists: true },
        passwordResetExpiry: { $gt: new Date() }
    })

    let user = null
    for (const u of users) {
        const isMatch = await bcrypt.compare(token, u.passwordResetToken)
        if (isMatch) {
            user = u
            break
        }
    }

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token")
    }

    const passwordValidation = validatePasswordStrength(password, user.username, user.email)
    if (!passwordValidation.isValid) {
        throw new ApiError(400, passwordValidation.errors.join(", "))
    }

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpiry = undefined
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"))
})

export { register, login, logout, refreshAccessToken, getCurrentUser, getUserByIdentifier, forgotPassword, resetPassword }
