import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/quiz.model.js';

dotenv.config();

async function activateQuiz() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find any quiz
    const quiz = await Quiz.findOne();
    
    if (!quiz) {
      console.log('No quiz found in the database. Creating a default quiz...');
      
      // Create a default quiz
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
            minScore: 5,
            discountPercentage: 6,
            couponPrefix: "BOOKQUIZ6"
          },
          {
            minScore: 2,
            discountPercentage: 2,
            couponPrefix: "BOOKQUIZ2"
          }
        ],
        isActive: true
      });
      
      await defaultQuiz.save();
      console.log(`Created and activated new quiz with ID: ${defaultQuiz._id}`);
    } else {
      // Activate the quiz
      quiz.isActive = true;
      await quiz.save();
      console.log(`Activated existing quiz: "${quiz.title}" (ID: ${quiz._id})`);
    }

    // Verify active quizzes
    const activeQuizzes = await Quiz.find({ isActive: true });
    console.log(`\nActive quizzes after operation: ${activeQuizzes.length}`);
    
    if (activeQuizzes.length > 0) {
      activeQuizzes.forEach((quiz, index) => {
        console.log(`\nActive Quiz ${index + 1}:`);
        console.log(`ID: ${quiz._id}`);
        console.log(`Title: ${quiz.title}`);
        console.log(`Questions: ${quiz.questions.length}`);
      });
    }

    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

activateQuiz();