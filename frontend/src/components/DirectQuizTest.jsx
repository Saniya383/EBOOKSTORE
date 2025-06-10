import React, { useState } from 'react';

const DirectQuizTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDirectFetch = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log('Testing direct fetch...');
      const response = await fetch('http://localhost:5000/api/quiz/active', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setResult(data);
      } else {
        setError(`Fetch failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const testXHR = () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log('Testing XHR...');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:5000/api/quiz/active', false);
      xhr.withCredentials = true;
      xhr.send(null);
      
      console.log('XHR status:', xhr.status);
      
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log('XHR data:', data);
        setResult(data);
      } else {
        setError(`XHR failed with status: ${xhr.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Direct Quiz API Test</h2>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
        
        <button
          onClick={testXHR}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          {loading ? 'Testing...' : 'Test XHR'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
          <pre className="text-red-300 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-emerald-900/50 border border-emerald-500 rounded">
          <h3 className="text-lg font-semibold text-emerald-400 mb-2">Result</h3>
          <div className="mb-2">
            <strong>Title:</strong> {result.title}
          </div>
          <div className="mb-2">
            <strong>Description:</strong> {result.description}
          </div>
          <div className="mb-2">
            <strong>Questions:</strong> {result.questions?.length || 0}
          </div>
          <details>
            <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300">
              View Full Response
            </summary>
            <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default DirectQuizTest;