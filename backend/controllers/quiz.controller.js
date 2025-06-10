import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import Coupon from "../models/coupon.model.js";
import UserQuiz from "../models/userQuizmodel.js";
import { v4 as uuidv4 } from "uuid";

// Reset the current user's quiz completion for the active quiz
export const resetMyQuizCompletion = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Find the active quiz
    const activeQuiz = await Quiz.findOne({ isActive: true });
    if (!activeQuiz) {
      return res.status(404).json({ message: "No active quiz found" });
    }
    
    // Delete the user's completion record for this quiz
    const deleteResult = await UserQuiz.deleteOne({ 
      email: req.user.email,
      quizId: activeQuiz._id
    });
    
    if (deleteResult.deletedCount > 0) {
      return res.json({ 
        message: "Your quiz completion has been reset. You can now take the quiz again.",
        quizTitle: activeQuiz.title
      });
    } else {
      return res.json({ 
        message: "No quiz completion record found to reset.",
        quizTitle: activeQuiz.title
      });
    }
  } catch (error) {
    console.error("Error resetting quiz completion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Debug function to check and clear UserQuiz records
export const debugUserQuizzes = async (req, res) => {
  try {
    // Get all UserQuiz records
    const allRecords = await UserQuiz.find({}).sort({ createdAt: -1 });
    
    // If clearAll parameter is provided, clear all records
    if (req.query.clearAll === 'true') {
      const deleteResult = await UserQuiz.deleteMany({});
      return res.json({ 
        message: `All UserQuiz records cleared (${deleteResult.deletedCount} records)`,
        previousRecords: allRecords
      });
    }
    
    // If email parameter is provided, clear records for that email
    if (req.query.email) {
      const emailRecords = await UserQuiz.find({ email: req.query.email });
      const deleteResult = await UserQuiz.deleteMany({ email: req.query.email });
      return res.json({ 
        message: `UserQuiz records cleared for email: ${req.query.email} (${deleteResult.deletedCount} records)`,
        previousRecords: emailRecords
      });
    }
    
    // If quizId parameter is provided, clear records for that quiz
    if (req.query.quizId) {
      const quizRecords = await UserQuiz.find({ quizId: req.query.quizId });
      const deleteResult = await UserQuiz.deleteMany({ quizId: req.query.quizId });
      return res.json({ 
        message: `UserQuiz records cleared for quiz ID: ${req.query.quizId} (${deleteResult.deletedCount} records)`,
        previousRecords: quizRecords
      });
    }
    
    // If userId parameter is provided, clear records for that user
    if (req.query.userId) {
      // Find the user's email first
      const user = await mongoose.model('User').findById(req.query.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userRecords = await UserQuiz.find({ email: user.email });
      const deleteResult = await UserQuiz.deleteMany({ email: user.email });
      return res.json({ 
        message: `UserQuiz records cleared for user: ${user.email} (${deleteResult.deletedCount} records)`,
        previousRecords: userRecords
      });
    }
    
    // Otherwise just return all records
    res.json({ 
      count: allRecords.length,
      records: allRecords
    });
  } catch (error) {
    console.error("Error in debugUserQuizzes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get active quiz
export const getActiveQuiz = async (req, res) => {
  try {
    console.log("Fetching active quiz...");
    
    // Force initialization of default quiz if needed
    const quizCount = await Quiz.countDocuments();
    console.log(`Total quizzes in database: ${quizCount}`);
    
    if (quizCount === 0) {
      console.log("No quizzes found, initializing default quiz");
      await initializeDefaultQuiz();
    }
    
    const quiz = await Quiz.findOne({ isActive: true });
    console.log("Active quiz query result:", quiz ? "Found" : "Not found");
    
    if (!quiz) {
      console.log("No active quiz found, checking for any quiz to activate");
      
      // Try to find any quiz and activate it
      const anyQuiz = await Quiz.findOne();
      
      if (anyQuiz) {
        console.log(`Found inactive quiz (${anyQuiz._id}), activating it`);
        anyQuiz.isActive = true;
        await anyQuiz.save();
        
        // Don't send the answers to the frontend
        const quizWithoutAnswers = {
          _id: anyQuiz._id,
          title: anyQuiz.title,
          description: anyQuiz.description,
          questions: anyQuiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options
          }))
        };
        
        return res.json(quizWithoutAnswers);
      }
      
      return res.status(404).json({ message: "No active quiz found" });
    }
    
    // Check if the user has already completed this quiz
    if (req.user) {
      try {
        // Let's add more detailed logging to debug the issue
        console.log("Checking if user has completed quiz:", {
          userId: req.user._id,
          userEmail: req.user.email,
          quizId: quiz._id,
          quizTitle: quiz.title
        });
        
        // First, let's check if there are any UserQuiz records for this user
        const allUserQuizzes = await UserQuiz.find({ email: req.user.email });
        console.log(`Found ${allUserQuizzes.length} quiz records for user ${req.user.email}`);
        
        // Now check for this specific quiz using quizId
        const userQuizRecord = await UserQuiz.findOne({ 
          email: req.user.email,
          quizId: quiz._id,
          completed: true
        });
        
        if (userQuizRecord) {
          console.log("User has already completed this quiz:", userQuizRecord);
          return res.status(403).json({ 
            message: "You have already completed this quiz. Please wait for a new quiz to be uploaded by the admin."
          });
        } else {
          console.log("User has not completed this quiz yet");
        }
      } catch (checkError) {
        // Log the error but don't block access to the quiz
        console.log("Error checking quiz completion status:", checkError);
        // Continue with the quiz delivery
      }
    }
    
    // Don't send the answers to the frontend
    const quizWithoutAnswers = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options
      }))
    };
    
    console.log(`Sending quiz "${quiz.title}" with ${quiz.questions.length} questions`);
    res.json(quizWithoutAnswers);
  } catch (error) {
    console.log("Error in getActiveQuiz controller:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit quiz answers and generate coupon if applicable
export const submitQuiz = async (req, res) => {
  try {
    console.log("Quiz submission received:", req.body);
    
    const { quizId, answers } = req.body;
    
    if (!req.user) {
      console.log("User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const userId = req.user._id;
    console.log("User ID:", userId);
    
    if (!quizId || !answers || !Array.isArray(answers)) {
      console.log("Invalid submission format:", { quizId, answers });
      return res.status(400).json({ message: "Invalid quiz submission" });
    }
    
    console.log("Looking for quiz with ID:", quizId);
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      console.log("Quiz not found with ID:", quizId);
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    console.log("Quiz found:", quiz.title);
    
    if (!quiz.isActive) {
      console.log("Quiz is not active");
      return res.status(400).json({ message: "This quiz is no longer active" });
    }
    
    // Calculate score
    let score = 0;
    const quizQuestions = quiz.questions;
    
    answers.forEach((answer, index) => {
      if (index < quizQuestions.length && answer === quizQuestions[index].answer) {
        score++;
      }
    });
    
    // Check if user qualifies for a reward
    let reward = null;
    for (const r of quiz.rewards) {
      if (score >= r.minScore) {
        reward = r;
        break;
      }
    }
    
    // If no reward, still record completion but return score only
    if (!reward) {
      try {
        // Record that the user has completed this quiz
        const userEmail = req.user.email;
        const quizId = quiz._id;
        const quizTitle = quiz.title;
        
        // Use findOneAndUpdate with upsert to handle both creation and update in one operation
        await UserQuiz.findOneAndUpdate(
          { email: userEmail, quizId: quizId },
          { 
            title: quizTitle,
            completed: true 
          },
          { upsert: true, new: true }
        );
        
        console.log(`User quiz completion recorded for ${userEmail} on quiz "${quizTitle}" (ID: ${quizId}) (no reward earned)`);
      } catch (recordError) {
        // Log the error but don't fail the whole operation
        console.log("Error recording quiz completion (no reward):", recordError);
        console.log("Error details:", recordError.message);
        // Continue with the response - this is not critical enough to fail the whole request
      }
      
      return res.json({
        score,
        totalQuestions: quizQuestions.length,
        message: "Thank you for taking the quiz!"
      });
    }
    
    // Check if user already has an active coupon
    const existingCoupon = await Coupon.findOne({ 
      userId, 
      isActive: true 
    });
    
    if (existingCoupon) {
      // Deactivate old coupon
      existingCoupon.isActive = false;
      await existingCoupon.save();
    }
    
    // Generate unique coupon code with enhanced uniqueness
    let couponCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      // Generate a unique identifier using multiple sources of randomness
      const uniqueId = uuidv4().substring(0, 6);
      const timestamp = Date.now().toString().slice(-4);
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      // Combine prefix with unique parts
      couponCode = `${reward.couponPrefix}-${uniqueId}${timestamp.slice(0, 2)}${randomNum.slice(0, 2)}`;
      
      // Check if this code already exists
      const existingCode = await Coupon.findOne({ code: couponCode });
      
      if (!existingCode) {
        isUnique = true;
        console.log(`Generated unique coupon: ${couponCode}`);
      } else {
        attempts++;
        console.log(`Coupon collision detected, attempt ${attempts}/${maxAttempts}`);
      }
    }
    
    // If we still couldn't generate a unique code after max attempts, use a failsafe approach
    if (!isUnique) {
      const userHash = userId.toString().slice(-4);
      const fullTimestamp = Date.now().toString();
      couponCode = `${reward.couponPrefix}-${userHash}${fullTimestamp.slice(-8)}`;
      console.log(`Using failsafe coupon generation: ${couponCode}`);
    }
    
    // Set expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    // Create new coupon
    const newCoupon = new Coupon({
      code: couponCode,
      discountPercentage: reward.discountPercentage,
      expirationDate,
      isActive: true,
      userId
    });
    
    await newCoupon.save();
    
    // Record that the user has completed this quiz
    try {
      const userEmail = req.user.email;
      const quizId = quiz._id;
      const quizTitle = quiz.title;
      
      // Use findOneAndUpdate with upsert to handle both creation and update in one operation
      await UserQuiz.findOneAndUpdate(
        { email: userEmail, quizId: quizId },
        { 
          title: quizTitle,
          completed: true 
        },
        { upsert: true, new: true }
      );
      
      console.log(`User quiz completion recorded for ${userEmail} on quiz "${quizTitle}" (ID: ${quizId})`);
    } catch (recordError) {
      // Log the error but don't fail the whole operation
      console.log("Error recording quiz completion:", recordError);
      console.log("Error details:", recordError.message);
      // Continue with the response - this is not critical enough to fail the whole request
    }
    
    res.json({
      score,
      totalQuestions: quizQuestions.length,
      coupon: {
        code: couponCode,
        discountPercentage: reward.discountPercentage,
        expirationDate
      },
      message: "Congratulations! You've earned a discount coupon."
    });
    
  } catch (error) {
    console.log("Error in submitQuiz controller:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    
    let errorMessage = "Server error processing quiz submission";
    
    // Provide more specific error messages for common issues
    if (error.name === 'ValidationError') {
      errorMessage = "Quiz submission validation failed: " + error.message;
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      errorMessage = "You have already completed this quiz";
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid quiz ID format";
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// Create a new quiz (admin only)
export const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, rewards } = req.body;
    
    if (!title || !description || !questions || !rewards) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Quiz must have at least one question" });
    }
    
    for (const q of questions) {
      if (!q.question || !q.options || !q.answer) {
        return res.status(400).json({ message: "Each question must have a question, options, and an answer" });
      }
      
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: "Each question must have at least 2 options" });
      }
      
      if (!q.options.includes(q.answer)) {
        return res.status(400).json({ message: "The answer must be one of the options" });
      }
    }
    
    // Validate rewards
    if (!Array.isArray(rewards) || rewards.length === 0) {
      return res.status(400).json({ message: "Quiz must have at least one reward tier" });
    }
    
    for (const r of rewards) {
      if (r.minScore === undefined || !r.discountPercentage || !r.couponPrefix) {
        return res.status(400).json({ message: "Each reward must have a minimum score, discount percentage, and coupon prefix" });
      }
    }
    
    // Sort rewards by minScore in descending order
    rewards.sort((a, b) => b.minScore - a.minScore);
    
    // Deactivate all existing quizzes
    await Quiz.updateMany({}, { isActive: false });
    
    // Create new quiz
    const newQuiz = new Quiz({
      title,
      description,
      questions,
      rewards
    });
    
    await newQuiz.save();
    
    // Reset all user quiz completion records to allow users to take the new quiz
    const deleteResult = await UserQuiz.deleteMany({});
    console.log(`Reset all user quiz records: ${deleteResult.deletedCount} records deleted`);
    
    res.status(201).json({
      message: "Quiz created successfully",
      quiz: newQuiz
    });
    
  } catch (error) {
    console.log("Error in createQuiz controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all quizzes (admin only)
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a quiz (admin only)
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    await Quiz.findByIdAndDelete(id);
    
    // If this was the active quiz, activate another one if available
    if (quiz.isActive) {
      const anotherQuiz = await Quiz.findOne({ _id: { $ne: id } });
      if (anotherQuiz) {
        anotherQuiz.isActive = true;
        await anotherQuiz.save();
      }
    }
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Activate a quiz (admin only)
export const activateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deactivate all quizzes
    await Quiz.updateMany({}, { isActive: false });
    
    // Activate the specified quiz
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json({ message: 'Quiz activated successfully', quiz });
  } catch (error) {
    console.error('Error activating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Initialize default book quiz if none exists
export const initializeDefaultQuiz = async () => {
  try {
    console.log("Initializing default quiz...");
    
    // Check if there's any active quiz
    const activeQuiz = await Quiz.findOne({ isActive: true });
    
    if (activeQuiz) {
      console.log(`Active quiz already exists: "${activeQuiz.title}" (ID: ${activeQuiz._id})`);
      return activeQuiz;
    }
    
    // Check if there's any quiz at all
    const existingQuiz = await Quiz.findOne();
    
    if (existingQuiz) {
      console.log(`Quiz exists but none are active, activating: "${existingQuiz.title}" (ID: ${existingQuiz._id})`);
      existingQuiz.isActive = true;
      await existingQuiz.save();
      return existingQuiz;
    }
    
    console.log("No quizzes found, creating default quiz");
    
    const defaultQuiz = new Quiz({
      title: "Book Lover's Quiz",
      description: "Test your knowledge about books and earn discount coupons!",
      questions: [
        {
          question: "What does the spell 'Alohomora' do?",
          options: ["Summons a wand", "Unlocks doors", "Turns invisible", "Makes tea"],
          answer: "Unlocks doors",
        },
        {
          question: "Which instrument does a certain famous detective enjoy playing?",
          options: ["Piano", "Violin", "Poirot", "Marple"],
          answer: "Violin",
        },
        {
          question: "What is considered a 'ruler's' greatest strength in ancient political texts?",
          options: ["Swordsmanship", "Gold reserves", "Clever advisors", "Royal elephants"],
          answer: "Clever advisors",
        },
        {
          question: "Which book series features a character named 'Frodo'?",
          options: ["Harry Potter", "The Hobbit", "The Chronicles of Narnia", "The Lord of the Rings"],
          answer: "The Lord of the Rings",
        },
        {
          question: "What is the name of Sherlock Holmes' assistant?",
          options: ["Watson", "Wilson", "Winston", "Walter"],
          answer: "Watson",
        },
        {
          question: "In the wizarding world, how do students receive their school letters?",
          options: ["Pigeon", "Magical Owl", "Floo Network", "Enchanted broom delivery"],
          answer: "Magical Owl",
        },
        {
          question: "Which of the following strategies is considered most dangerous for a ruler in maintaining power?",
          options: [
            "Fostering loyalty through rewards and privileges",
            "Surrounding oneself with equally powerful individuals",
            "Relying on the support of the military to maintain control",
            "Granting autonomy to local leaders and communities"
          ],
          answer: "Surrounding oneself with equally powerful individuals",
        },
        {
          question: "In business, if your competitor knows your every move, how can you maintain the upper hand?",
          options: [
            "Increase transparency to build trust",
            "Diversify your strategies and keep evolving",
            "Use their knowledge against them by setting traps",
            "Slow down and make them overestimate your plans"
          ],
          answer: "Diversify your strategies and keep evolving",
        },
      ],
      rewards: [
        {
          minScore: 7,
          discountPercentage: 10,
          couponPrefix: "BOOKQUIZ10"
        },
        {
          minScore: 4,
          discountPercentage: 4,
          couponPrefix: "BOOKQUIZ4"
        },
        {
          minScore: 1,
          discountPercentage: 1,
          couponPrefix: "BOOKQUIZ1"
        }
      ],
      isActive: true
    });
    
    await defaultQuiz.save();
    console.log(`Default quiz initialized successfully (ID: ${defaultQuiz._id})`);
    return defaultQuiz;
    
  } catch (error) {
    console.log("Error initializing default quiz:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    throw error; // Re-throw to allow proper handling
  }
};