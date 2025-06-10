import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/quiz.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkQuizzes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check all quizzes
    const allQuizzes = await Quiz.find({});
    console.log(`Total quizzes in database: ${allQuizzes.length}`);
    
    if (allQuizzes.length > 0) {
      allQuizzes.forEach((quiz, index) => {
        console.log(`\nQuiz ${index + 1}:`);
        console.log(`ID: ${quiz._id}`);
        console.log(`Title: ${quiz.title}`);
        console.log(`Description: ${quiz.description}`);
        console.log(`Questions: ${quiz.questions.length}`);
        console.log(`Is Active: ${quiz.isActive}`);
        console.log(`Created At: ${quiz.createdAt}`);
      });
    } else {
      console.log('No quizzes found in the database');
    }

    // Check active quizzes
    const activeQuizzes = await Quiz.find({ isActive: true });
    console.log(`\nActive quizzes: ${activeQuizzes.length}`);
    
    if (activeQuizzes.length > 0) {
      activeQuizzes.forEach((quiz, index) => {
        console.log(`\nActive Quiz ${index + 1}:`);
        console.log(`ID: ${quiz._id}`);
        console.log(`Title: ${quiz.title}`);
      });
    } else {
      console.log('No active quizzes found');
    }

    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkQuizzes();