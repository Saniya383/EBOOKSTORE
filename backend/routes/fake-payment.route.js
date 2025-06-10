import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { processFakePayment, getPaymentMethods } from "../controllers/fake-payment.controller.js";

const router = express.Router();

// Process a fake payment
router.post("/process", protectRoute, processFakePayment);

// Get available payment methods
router.get("/methods", protectRoute, getPaymentMethods);

export default router;