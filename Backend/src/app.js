import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.routes.js"
import { walletRouter } from "./routes/wallet.routes.js"
import { transactionRouter } from "./routes/transaction.routes.js"
import { adminRouter } from "./routes/admin.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/users", userRouter)
app.use("/api/v1/wallet", walletRouter)
app.use("/api/v1/transactions", transactionRouter)
app.use("/api/v1/admin", adminRouter)

app.use(errorHandler)

export { app };