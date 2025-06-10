 import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useUserStore } from '../stores/useUserStore';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const BookQuiz = () => {
  const { user } = useUserStore();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log(`Fetching quiz from backend... (Attempt ${retryCount + 1})`);
        setError(null);
        
        // Add a small delay to ensure the server has time to initialize
        // Increase delay with each retry
        const delay = 500 + (retryCount * 500);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // First try with direct fetch to debug any issues
        console.log('Trying direct fetch first...');
        try {
          const directResponse = await fetch('http://localhost:5000/api/quiz/active', {
            method: 'GET',
            credentials: 'include'
          });
          console.log('Direct fetch status:', directResponse.status);
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('Direct fetch data:', directData);
            
            if (directData && directData.questions && directData.questions.length > 0) {
              console.log('Using data from direct fetch');
              setQuiz(directData);
              setAnswers(new Array(directData.questions.length).fill(''));
              toast.success('Quiz loaded successfully!');
              setLoading(false);
              return;
            }
          }
        } catch (fetchError) {
          console.error('Direct fetch failed:', fetchError);
        }
        
        // If direct fetch failed or returned invalid data, try with axios
        console.log('Trying with axios...');
        // The axios instance already has the /api prefix in the baseURL
        const response = await axios.get('/quiz/active');
        console.log('Axios response status:', response.status);
        console.log('Quiz data received:', response.data);
        
        if (!response.data || !response.data.questions || response.data.questions.length === 0) {
          console.error('Invalid quiz data received:', response.data);
          setError('Quiz data is invalid. Please contact support.');
          toast.error('Quiz data is invalid. Please contact support.');
          setLoading(false);
          return;
        }
        
        setQuiz(response.data);
        // Initialize answers array with empty strings
        setAnswers(new Array(response.data.questions.length).fill(''));
        toast.success('Quiz loaded successfully!');
      } catch (error) {
        console.error('Error fetching quiz:', error);
        
        // Try one more approach - direct API call with full URL
        try {
          console.log('Trying one last approach with XMLHttpRequest...');
          const xhr = new XMLHttpRequest();
          xhr.open('GET', 'http://localhost:5000/api/quiz/active', false); // Synchronous request
          xhr.withCredentials = true;
          xhr.send(null);
          
          if (xhr.status === 200) {
            console.log('XHR successful:', xhr.responseText);
            const data = JSON.parse(xhr.responseText);
            if (data && data.questions && data.questions.length > 0) {
              console.log('Using data from XHR');
              setQuiz(data);
              setAnswers(new Array(data.questions.length).fill(''));
              toast.success('Quiz loaded successfully!');
              setLoading(false);
              return;
            }
          } else {
            console.error('XHR failed with status:', xhr.status);
          }
        } catch (xhrError) {
          console.error('XHR approach failed:', xhrError);
        }
        
        if (error.response) {
          console.error('Error response:', error.response.data);
          
          if (error.response.status === 404) {
            // No active quiz found - this is a normal state
            setError('No active quizzes available at the moment.');
            toast.error('No active quizzes available at the moment.');
          } else if (error.response.status === 403 && error.response.data.message.includes("already completed")) {
            // User has already completed this quiz
            setError(error.response.data.message);
            toast.error(error.response.data.message);
          } else {
            const errorMsg = `Failed to load quiz: ${error.response.data.message || 'Server error'}`;
            setError(errorMsg);
            toast.error(errorMsg);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError('No response from server. Please check your connection.');
          toast.error('No response from server. Please check your connection.');
        } else {
          console.error('Error message:', error.message);
          setError('Failed to load quiz. Please try again later.');
          toast.error('Failed to load quiz. Please try again later.');
        }
        
        // Auto-retry up to 3 times if there's a server error
        if (retryCount < 3 && (!error.response || error.response.status >= 500)) {
          console.log(`Auto-retrying (${retryCount + 1}/3)...`);
          setRetryCount(retryCount + 1);
          setLoading(true);
          return; // Don't set loading to false yet
        }
      } finally {
        if (retryCount >= 3 || !loading) {
          setLoading(false);
        }
      }
    };

    if (loading) {
      fetchQuiz();
    }
    
    // Add a timeout to show an error if loading takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Quiz loading timeout reached');
        setLoading(false);
        setError('Quiz is taking too long to load. Please try again later.');
        toast.error('Quiz is taking too long to load. Please try again later.');
      }
    }, 15000); // 15 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [loading, retryCount]);

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    // Save the current answer
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);

    // Move to next question
    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1);
      setSelected('');
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setSelected(answers[current - 1]);
    }
  };

  // Function to reset quiz completion
  const handleResetCompletion = async () => {
    if (!user) {
      toast.error('Please log in to reset your quiz progress');
      return;
    }
    
    setIsResetting(true);
    
    try {
      const response = await axios.post('/quiz/reset-my-completion');
      toast.success(response.data.message);
      
      // Reload the quiz
      setLoading(true);
      setError(null);
      setRetryCount(retryCount + 1);
    } catch (error) {
      console.error('Error resetting quiz completion:', error);
      toast.error('Failed to reset quiz completion. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async () => {
    // Save the last answer
    const finalAnswers = [...answers];
    finalAnswers[current] = selected;
    setAnswers(finalAnswers);

    if (!user) {
      toast.error('Please log in to submit your quiz and earn rewards');
      // Redirect to login page with return URL
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    // Double check that we have a valid user with ID
    if (!user._id) {
      toast.error('User session is invalid. Please log in again.');
      return;
    }

    // Validate that all questions have been answered
    const unansweredQuestions = finalAnswers.filter(answer => !answer).length;
    if (unansweredQuestions > 0) {
      toast.error(`Please answer all questions before submitting (${unansweredQuestions} remaining)`);
      return;
    }

    setSubmitting(true);
    console.log('Submitting quiz answers:', {
      quizId: quiz._id,
      answers: finalAnswers
    });

    try {
      toast.loading('Submitting your answers...', { id: 'quiz-submit' });
      
      const response = await axios.post('/quiz/submit', {
        quizId: quiz._id,
        answers: finalAnswers
      });

      console.log('Quiz submission response:', response.data);
      toast.dismiss('quiz-submit');
      
      setResult(response.data);
      setSubmitted(true);

      if (response.data.coupon) {
        toast.success(`Congratulations! You earned a ${response.data.coupon.discountPercentage}% discount coupon!`);
      } else {
        toast.success('Quiz completed! Keep learning to earn rewards next time.');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.dismiss('quiz-submit');
      
      // Get more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }, 2000);
        } else {
          const errorMessage = error.response.data.message || 'Failed to submit quiz';
          toast.error(`${errorMessage}. Please try again.`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        toast.error('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        toast.error('Failed to submit quiz. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-800 rounded-lg p-6">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
        <span className="text-emerald-500 text-lg font-medium">Loading quiz...</span>
        <p className="text-gray-400 mt-2 text-center max-w-md">
          We're preparing your book knowledge challenge. This should only take a moment...
        </p>
      </div>
    );
  }

  if (!quiz) {
    // Check if the error message indicates the user has already completed the quiz
    const hasCompletedQuiz = error && error.includes("You have already completed this quiz");
    
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold text-red-400 mb-3">Quiz Unavailable</h2>
        <p className="mt-2 text-gray-300 mb-4">
          {error ? error : "Sorry, there are no active quizzes at the moment. Please check back later!"}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetryCount(retryCount + 1);
              toast.success("Retrying quiz load...");
            }} 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white font-medium transition-colors"
          >
            Try Again
          </button>
          
          {hasCompletedQuiz && user && (
            <button 
              onClick={handleResetCompletion}
              disabled={isResetting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors flex items-center justify-center"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset My Progress"
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">
          Quiz Completed!
        </h2>
        <p className="text-xl mb-6">
          You scored {result.score} out of {result.totalQuestions}
        </p>

        {result.coupon ? (
          <div className="bg-gray-700 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-emerald-400 mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-gray-300 mb-4">
              You've earned a {result.coupon.discountPercentage}% discount coupon:
            </p>
            <div className="bg-emerald-900/50 p-3 rounded-md border border-emerald-500">
              <p className="text-emerald-400 text-xl font-mono font-bold tracking-wider">
                {result.coupon.code}
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Valid until: {new Date(result.coupon.expirationDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              This coupon has been added to your account and can be used at checkout.
            </p>
          </div>
        ) : (
          <div className="bg-gray-700 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">
              Keep Learning!
            </h3>
            <p className="text-gray-300">
              You didn't qualify for a reward this time. Keep reading and try again to earn discounts!
            </p>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors"
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">{quiz.title}</h2>
        <p className="text-gray-300">{quiz.description}</p>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          Question {current + 1} of {quiz.questions.length}
        </span>
        <div className="h-2 bg-gray-700 rounded-full w-2/3">
          <div
            className="h-2 bg-emerald-500 rounded-full"
            style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gray-700/50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">
          {quiz.questions[current].question}
        </h3>

        <div className="space-y-3">
          {quiz.questions[current].options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selected === option
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
              }`}
            >
              <label className="flex items-center cursor-pointer w-full">
                <input
                  type="radio"
                  name="option"
                  value={option}
                  checked={selected === option}
                  onChange={() => handleSelect(option)}
                  className="mr-3"
                />
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={current === 0}
          className={`px-4 py-2 rounded font-semibold ${
            current === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
        >
          Previous
        </button>

        {current + 1 < quiz.questions.length ? (
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`px-4 py-2 rounded font-semibold ${
              selected
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className={`px-4 py-2 rounded font-semibold ${
              selected && !submitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Submitting...
              </span>
            ) : (
              'Submit Quiz'
            )}
          </button>
        )}
      </div>

      {!user && (
        <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-600 rounded-lg text-yellow-400 text-sm">
          <strong>Note:</strong> You need to be logged in to earn rewards from this quiz.
        </div>
      )}
    </div>
  );
};

export default BookQuiz;