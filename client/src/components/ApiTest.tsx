import React, { useState } from 'react';
import api from '../services/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Test basic API connectivity
      const response = await api.get('/test');
      setTestResult('✅ API Connection Successful!');
    } catch (error: any) {
      console.error('API Test Error:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setTestResult('❌ Network Error: Cannot connect to backend. Please check if server is running on localhost:8000');
      } else if (error.response) {
        setTestResult(`❌ Server Error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setTestResult(`❌ Connection Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <button
        onClick={testApiConnection}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold">Troubleshooting:</p>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>Make sure backend server is running on <code>localhost:8000</code></li>
          <li>Check if there are any firewall issues blocking the connection</li>
          <li>Verify the API_BASE_URL in <code>src/services/api.js</code></li>
          <li>Try accessing <code>http://localhost:8000/api</code> directly in browser</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
