import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { 
  getActiveQuiz, 
  submitQuiz, 
  createQuiz, 
  getAllQuizzes, 
  deleteQuiz, 
  activateQuiz,
  debugUserQuizzes,
  resetMyQuizCompletion
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Get active quiz (public)
router.get("/active", getActiveQuiz);

// Submit quiz answers (requires authentication)
router.post("/submit", protectRoute, submitQuiz);

// Admin routes
// Get all quizzes
router.get("/all", protectRoute, adminRoute, getAllQuizzes);

// Create a new quiz
router.post("/create", protectRoute, adminRoute, createQuiz);

// Delete a quiz
router.delete("/:id", protectRoute, adminRoute, deleteQuiz);

// Activate a quiz
router.patch("/:id/activate", protectRoute, adminRoute, activateQuiz);

// Debug route for UserQuiz records (admin only)
router.get("/debug/user-quizzes", protectRoute, adminRoute, debugUserQuizzes);

// Reset the current user's quiz completion for the active quiz
router.post("/reset-my-completion", protectRoute, resetMyQuizCompletion);

export default router;