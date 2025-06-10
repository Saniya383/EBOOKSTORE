import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/quiz.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixQuizRewards() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the active quiz
    const activeQuiz = await Quiz.findOne({ isActive: true });
    
    if (!activeQuiz) {
      console.log('No active quiz found');
      return;
    }

    console.log(`Found active quiz: "${activeQuiz.title}"`);
    console.log(`Current rewards: ${activeQuiz.rewards.length}`);
    
    // Update the rewards according to the requirements:
    // 7-10 correct answers → 10% discount
    // 4-6 correct answers → 5% discount  
    // 1-3 correct answers → 2% discount
    // 0 correct answers → no discount
    
    const newRewards = [
      {
        minScore: 7,
        discountPercentage: 10,
        couponPrefix: "BOOKQUIZ10"
      },
      {
        minScore: 4,
        discountPercentage: 5,
        couponPrefix: "BOOKQUIZ5"
      },
      {
        minScore: 1,
        discountPercentage: 2,
        couponPrefix: "BOOKQUIZ2"
      }
    ];

    console.log('\nUpdating rewards to:');
    newRewards.forEach((reward, index) => {
      console.log(`  Reward ${index + 1}: ${reward.minScore}+ correct = ${reward.discountPercentage}% discount (${reward.couponPrefix})`);
    });

    // Update the quiz
    activeQuiz.rewards = newRewards;
    await activeQuiz.save();

    console.log('\n✅ Quiz rewards updated successfully!');
    
    // Verify the update
    const updatedQuiz = await Quiz.findById(activeQuiz._id);
    console.log('\nVerification - Updated rewards:');
    updatedQuiz.rewards.forEach((reward, index) => {
      console.log(`  Reward ${index + 1}: ${reward.minScore}+ correct = ${reward.discountPercentage}% discount (${reward.couponPrefix})`);
    });

    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixQuizRewards();