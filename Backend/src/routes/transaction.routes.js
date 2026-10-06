import { Router } from "express";
import { getMyTransactions } from "../controllers/transaction.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/my-transactions").get(verifyJWT, getMyTransactions);

export { router as transactionRouter };
