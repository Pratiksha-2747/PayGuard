import { Router } from "express";
import { register, login, logout, refreshAccessToken, getCurrentUser, getUserByIdentifier, forgotPassword, resetPassword } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(authRateLimiter, login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/lookup/:identifier").get(verifyJWT, getUserByIdentifier);
router.route("/forgot-password").post(authRateLimiter, forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export { router as userRouter };
