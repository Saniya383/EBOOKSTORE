import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import fakePaymentRoutes from "./routes/fake-payments.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import quizRoutes from "./routes/quiz.route.js";
import { initializeDefaultQuiz } from "./controllers/quiz.controller.js";

dotenv.config();
const app=express();
const PORT=process.env.PORT||5000;
const __dirname = path.resolve();

app.use(express.json({limit: "10mb"}));
app.use(cookieParser());

// Add CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fake-payments", fakePaymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/quiz", quizRoutes);
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}
app.listen(PORT,()=>{
    console.log("Server is running on http://localhost:"+PORT);
    connectDB().then(async () => {
        try {
            // Initialize default quiz after database connection
            console.log("Ensuring quiz data is available...");
            const quiz = await initializeDefaultQuiz();
            if (quiz) {
                console.log(`Quiz ready: "${quiz.title}" with ${quiz.questions.length} questions`);
            } else {
                console.log("No quiz was initialized or found");
            }
        } catch (error) {
            console.error("Error during quiz initialization:", error);
        }
    }).catch(err => {
        console.error("Database connection failed:", err);
    });
});