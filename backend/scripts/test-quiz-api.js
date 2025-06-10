import axios from 'axios';

async function testQuizAPI() {
  try {
    console.log('Testing quiz API endpoint...');
    const response = await axios.get('http://localhost:5000/api/quiz/active');
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.questions) {
      console.log(`Quiz title: ${response.data.title}`);
      console.log(`Number of questions: ${response.data.questions.length}`);
    } else {
      console.log('No valid quiz data in response');
    }
  } catch (error) {
    console.error('Error testing API:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testQuizAPI();