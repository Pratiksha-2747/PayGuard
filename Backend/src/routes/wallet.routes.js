import { Router } from "express";
import { deposit, withdraw, transfer, getBalance } from "../controllers/wallet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/deposit").post(verifyJWT, deposit);
router.route("/withdraw").post(verifyJWT, withdraw);
router.route("/transfer").post(verifyJWT, transfer);
router.route("/balance").get(verifyJWT, getBalance);

export { router as walletRouter };
