import React from 'react';
import QuizTest from '../components/QuizTest';
import DirectQuizTest from '../components/DirectQuizTest';

const QuizTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Quiz API Test</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Direct API Tests</h2>
        <DirectQuizTest />
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Combined API Tests</h2>
        <QuizTest />
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
        <p>After testing, go to the <a href="/quiz" className="text-emerald-400 hover:underline">Quiz Page</a> to see if it's working.</p>
      </div>
    </div>
  );
};

export default QuizTestPage;