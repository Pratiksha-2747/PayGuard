import { Router } from "express";
import { getTotalBalance, getFailedTransactions, toggleUserActive, getAllUsers } from "../controllers/admin.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/total-balance").get(verifyJWT, isAdmin, getTotalBalance);
router.route("/failed-transactions").get(verifyJWT, isAdmin, getFailedTransactions);
router.route("/users").get(verifyJWT, isAdmin, getAllUsers);
router.route("/users/:userId/toggle-active").patch(verifyJWT, isAdmin, toggleUserActive);

export { router as adminRouter };
