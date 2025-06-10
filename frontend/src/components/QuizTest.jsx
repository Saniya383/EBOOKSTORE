import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';

const QuizTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testQuizAPI = async () => {
      try {
        console.log('Testing quiz API endpoint...');
        
        // Make the request directly to the full URL to bypass any potential baseURL issues
        const directResponse = await fetch('http://localhost:5000/api/quiz/active', {
          method: 'GET',
          credentials: 'include'
        });
        
        console.log('Direct fetch response status:', directResponse.status);
        const directData = await directResponse.json();
        console.log('Direct fetch data:', directData);
        
        // Now try with axios
        const axiosResponse = await axios.get('/quiz/active');
        console.log('Axios response status:', axiosResponse.status);
        console.log('Axios data:', axiosResponse.data);
        
        setResult({
          direct: directData,
          axios: axiosResponse.data
        });
      } catch (error) {
        console.error('Error testing API:', error);
        setError(error.toString());
      } finally {
        setLoading(false);
      }
    };

    testQuizAPI();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error Testing Quiz API</h2>
        <pre>{error}</pre>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Quiz API Test Results</h2>
      
      <h3>Direct Fetch Result:</h3>
      <pre>{JSON.stringify(result?.direct, null, 2)}</pre>
      
      <h3>Axios Result:</h3>
      <pre>{JSON.stringify(result?.axios, null, 2)}</pre>
    </div>
  );
};

export default QuizTest;