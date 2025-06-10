import React from 'react';
import BookQuiz from '../components/BookQuiz';
import { motion } from 'framer-motion';
import { BookOpen, Gift, Brain } from 'lucide-react';

const BookQuizPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-4 text-emerald-400">📚 Book Lover's Quiz</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Test your knowledge about literature, earn rewards, and discover new books!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800/60 p-6 rounded-lg text-center"
          >
            <BookOpen className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Test Your Knowledge</h3>
            <p className="text-gray-300">
              Answer questions about famous books, authors, and literary concepts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/60 p-6 rounded-lg text-center"
          >
            <Brain className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learn New Things</h3>
            <p className="text-gray-300">
              Expand your literary horizons and discover interesting book facts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/60 p-6 rounded-lg text-center"
          >
            <Gift className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-300">
              Get discount coupons based on your quiz performance to use on your next purchase.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <BookQuiz />
        </motion.div>
      </div>
    </div>
  );
};

export default BookQuizPage;
