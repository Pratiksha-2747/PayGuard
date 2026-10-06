import { Router } from "express";
import { deposit, withdraw, transfer } from "../controllers/wallet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/deposit").post(verifyJWT, deposit);
router.route("/withdraw").post(verifyJWT, withdraw);
router.route("/transfer").post(verifyJWT, transfer);

export { router as walletRouter };
