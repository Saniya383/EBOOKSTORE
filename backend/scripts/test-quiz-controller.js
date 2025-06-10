import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getActiveQuiz } from '../controllers/quiz.controller.js';

dotenv.config();

// Mock Express request and response objects
const mockRequest = {};

const mockResponse = {
  status: function(code) {
    console.log(`Response status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('Response data:', JSON.stringify(data, null, 2));
    return this;
  }
};

async function testQuizController() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('\nTesting getActiveQuiz controller...');
    await getActiveQuiz(mockRequest, mockResponse);

    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuizController();