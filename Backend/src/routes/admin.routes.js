import { Router } from "express";
import { getTotalBalance, getFailedTransactions } from "../controllers/admin.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/total-balance").get(verifyJWT, isAdmin, getTotalBalance);
router.route("/failed-transactions").get(verifyJWT, isAdmin, getFailedTransactions);

export { router as adminRouter };
