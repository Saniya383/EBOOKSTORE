import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash, Check, X } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const defaultQuestion = {
  question: '',
  type: 'single', // 'single' or 'multiple'
  options: ['', ''],
  answer: '', // For single choice
  answers: [] // For multiple choice
};

const defaultRewards = [
  {
    minScore: 7,
    discountPercentage: 10,
    couponPrefix: 'QUIZ10'
  },
  {
    minScore: 4,
    discountPercentage: 4,
    couponPrefix: 'QUIZ4'
  },
  {
    minScore: 1,
    discountPercentage: 1,
    couponPrefix: 'QUIZ1'
  }
];

const QuizManagement = () => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [ { ...defaultQuestion } ],
    rewards: [ ...defaultRewards ]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/quiz/all');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    // Validate form data
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];

      if (!question.question || question.question.trim() === '') {
        toast.error(`Question ${i + 1}: Please enter the question text`);
        return;
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        toast.error(`Question ${i + 1}: Please provide at least two options`);
        return;
      }

      const emptyOptions = question.options.filter(opt => !opt || opt.trim() === '');
      if (emptyOptions.length > 0) {
        toast.error(`Question ${i + 1}: Please fill in all options`);
        return;
      }

      if (question.type === 'single') {
        if (!question.answer || question.answer.trim() === '') {
          toast.error(`Question ${i + 1}: Please select a correct answer`);
          return;
        }
        if (!question.options.includes(question.answer)) {
          toast.error(`Question ${i + 1}: The selected answer must be one of the options`);
          return;
        }
      } else if (question.type === 'multiple') {
        if (!Array.isArray(question.answers) || question.answers.length === 0) {
          toast.error(`Question ${i + 1}: Please select at least one correct answer`);
          return;
        }
        if (!question.answers.every(ans => question.options.includes(ans))) {
          toast.error(`Question ${i + 1}: All selected answers must be from the options list`);
          return;
        }
      } else {
        toast.error(`Question ${i + 1}: Invalid question type`);
        return;
      }
    }

    if (!formData.title || formData.title.trim() === '') {
      toast.error('Please enter a quiz title');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      toast.error('Please enter a quiz description');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('/quiz/create', formData);
      toast.success('Quiz created successfully!');
      setQuizzes([...quizzes, response.data.quiz]);
      setShowCreateForm(false);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await axios.delete(`/quiz/${quizId}`);
      toast.success('Quiz deleted successfully');
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleActivateQuiz = async (quizId) => {
    try {
      await axios.patch(`/quiz/${quizId}/activate`);
      toast.success('Quiz activated successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error activating quiz:', error);
      toast.error('Failed to activate quiz');
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...defaultQuestion }]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push('');
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    const removedOption = newQuestions[questionIndex].options[optionIndex];
    newQuestions[questionIndex].options.splice(optionIndex, 1);

    // Remove from answers if present
    if (newQuestions[questionIndex].type === 'single' && newQuestions[questionIndex].answer === removedOption) {
      newQuestions[questionIndex].answer = '';
    }
    if (newQuestions[questionIndex].type === 'multiple') {
      newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(ans => ans !== removedOption);
    }

    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;

    // Reset answers when switching type
    if (field === 'type') {
      newQuestions[index].answer = '';
      newQuestions[index].answers = [];
    }

    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    const oldOption = newQuestions[questionIndex].options[optionIndex];
    newQuestions[questionIndex].options[optionIndex] = value;

    // Update answer(s) if option text changes
    if (newQuestions[questionIndex].type === 'single' && newQuestions[questionIndex].answer === oldOption) {
      newQuestions[questionIndex].answer = value;
    }
    if (newQuestions[questionIndex].type === 'multiple') {
      newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.map(ans => ans === oldOption ? value : ans);
    }

    setFormData({ ...formData, questions: newQuestions });
  };

  const handleMultipleAnswerChange = (questionIndex, option, isChecked) => {
    const newQuestions = [...formData.questions];
    if (isChecked) {
      if (!newQuestions[questionIndex].answers.includes(option)) {
        newQuestions[questionIndex].answers.push(option);
      }
    } else {
      newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(ans => ans !== option);
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      questions: [ { ...defaultQuestion } ],
      rewards: [ ...defaultRewards ]
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-400">Quiz Management</h2>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); resetForm(); }}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white transition-colors"
          >
            {showCreateForm ? (
              <>
                <X className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Create Quiz
              </>
            )}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-emerald-400">Create New Quiz</h3>
            <form onSubmit={handleCreateQuiz}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-medium text-emerald-400">Questions</h4>
                </div>
                {formData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="bg-gray-800 p-4 rounded-md mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-md font-medium">Question {qIndex + 1}</h5>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        placeholder="Enter question"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Question Type</label>
                      <select
                        value={question.type}
                        onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="single">Single Choice</option>
                        <option value="multiple">Multiple Choice</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Options</label>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
                        >
                          Add Option
                        </button>
                      </div>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                          />
                          {question.type === 'single' ? (
                            <button
                              type="button"
                              onClick={() => handleQuestionChange(qIndex, 'answer', option)}
                              className={`ml-2 p-2 rounded-md ${
                                question.answer === option
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                              title="Set as correct answer"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          ) : (
                            <input
                              type="checkbox"
                              checked={question.answers.includes(option)}
                              onChange={(e) => handleMultipleAnswerChange(qIndex, option, e.target.checked)}
                              className="ml-2 h-5 w-5 rounded border-gray-600 bg-gray-700 text-emerald-600 focus:ring-emerald-500"
                            />
                          )}
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="ml-2 p-2 rounded-md bg-gray-600 text-red-400 hover:text-red-300"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.type === 'single' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Correct Answer</label>
                        <select
                          value={question.answer}
                          onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          required
                        >
                          <option value="">Select correct answer</option>
                          {question.options.map((option, oIndex) => (
                            <option key={oIndex} value={option}>
                              {option || `Option ${oIndex + 1} (empty)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-medium text-emerald-400 mb-2">Reward Tiers</h4>
                <div className="bg-gray-800 p-4 rounded-md">
                  {formData.rewards.map((reward, idx) => (
                    <div className="mb-4" key={idx}>
                      <h5 className={`text-md font-medium mb-2 ${
                        idx === 0 ? 'text-emerald-400' : idx === 1 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {`Tier ${idx + 1} (${reward.minScore}+ correct: ${reward.discountPercentage}% discount)`}
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Min Score</label>
                          <input
                            type="number"
                            value={reward.minScore}
                            onChange={(e) => {
                              const newRewards = [...formData.rewards];
                              newRewards[idx].minScore = parseInt(e.target.value);
                              setFormData({ ...formData, rewards: newRewards });
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Discount (%)</label>
                          <input
                            type="number"
                            value={reward.discountPercentage}
                            onChange={(e) => {
                              const newRewards = [...formData.rewards];
                              newRewards[idx].discountPercentage = parseInt(e.target.value);
                              setFormData({ ...formData, rewards: newRewards });
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            min="1"
                            max="100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Coupon Prefix</label>
                          <input
                            type="text"
                            value={reward.couponPrefix}
                            onChange={(e) => {
                              const newRewards = [...formData.rewards];
                              newRewards[idx].couponPrefix = e.target.value;
                              setFormData({ ...formData, rewards: newRewards });
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white flex items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Quiz'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-4">Existing Quizzes</h3>
          {quizzes.length === 0 ? (
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-300">No quizzes found. Create your first quiz!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{quiz.title}</div>
                        <div className="text-sm text-gray-400">{quiz.description.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{quiz.questions.length} questions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quiz.isActive 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {quiz.rewards.map((reward, index) => (
                            <div key={index}>
                              {reward.discountPercentage}% off ({reward.minScore}+ correct)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!quiz.isActive && (
                            <button
                              onClick={() => handleActivateQuiz(quiz._id)}
                              className="text-emerald-400 hover:text-emerald-300"
                              title="Activate Quiz"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete Quiz"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizManagement;