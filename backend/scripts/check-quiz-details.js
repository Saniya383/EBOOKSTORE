import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/quiz.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkQuizDetails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check active quiz details
    const activeQuiz = await Quiz.findOne({ isActive: true });
    
    if (!activeQuiz) {
      console.log('No active quiz found');
      return;
    }

    console.log('\n=== ACTIVE QUIZ DETAILS ===');
    console.log(`ID: ${activeQuiz._id}`);
    console.log(`Title: ${activeQuiz.title}`);
    console.log(`Description: ${activeQuiz.description}`);
    console.log(`Questions: ${activeQuiz.questions.length}`);
    console.log(`Is Active: ${activeQuiz.isActive}`);
    
    console.log('\n=== QUESTIONS ===');
    activeQuiz.questions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}: ${q.question}`);
      console.log(`Options: ${q.options.join(', ')}`);
      console.log(`Answer: ${q.answer}`);
    });
    
    console.log('\n=== REWARDS CONFIGURATION ===');
    if (activeQuiz.rewards && activeQuiz.rewards.length > 0) {
      activeQuiz.rewards.forEach((reward, index) => {
        console.log(`\nReward ${index + 1}:`);
        console.log(`  Min Score: ${reward.minScore}`);
        console.log(`  Discount: ${reward.discountPercentage}%`);
        console.log(`  Coupon Prefix: ${reward.couponPrefix}`);
      });
    } else {
      console.log('No rewards configured');
    }

    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkQuizDetails();