import express from "express";
import { login, logout, refreshToken, signup, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/signup",signup);
router.post("/Login",login);
router.post("/Logout",logout);
router.post("/refresh-token",refreshToken);
router.get("/profile", protectRoute, getProfile);

export default router;