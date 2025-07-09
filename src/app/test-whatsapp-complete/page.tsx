"use client";

import { useState } from 'react';

export default function TestWhatsAppComplete() {
  const [phone, setPhone] = useState('201234567890');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});

  const testEnvironment = async () => {
    try {
      const response = await fetch('/api/test-env');
      const data = await response.json();
      setResults(prev => ({ ...prev, environment: data }));
      console.log('Environment test result:', data);
    } catch (error) {
      console.error('Environment test error:', error);
      setResults(prev => ({ ...prev, environment: { error: error.message } }));
    }
  };

  const testWhatsAppAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing WhatsApp API...');
      
      const response = await fetch('/api/notifications/whatsapp/beon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, name }),
      });

      const data = await response.json();
      setResults(prev => ({ ...prev, whatsapp: { status: response.status, data } }));
      console.log('WhatsApp API test result:', { status: response.status, data });
    } catch (error: any) {
      console.error('WhatsApp API test error:', error);
      setResults(prev => ({ ...prev, whatsapp: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    setResults({});
    await testEnvironment();
    await testWhatsAppAPI();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">WhatsApp API Complete Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (with country code)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="201234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test User"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testEnvironment}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Test Environment
          </button>
          
          <button
            onClick={testWhatsAppAPI}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test WhatsApp API'}
          </button>
          
          <button
            onClick={testAll}
            disabled={loading}
            className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            Test All
          </button>
        </div>

        {/* Environment Test Results */}
        {results.environment && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Environment Variables Test</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(results.environment, null, 2)}
            </pre>
          </div>
        )}

        {/* WhatsApp API Test Results */}
        {results.whatsapp && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-3">WhatsApp API Test</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(results.whatsapp, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-blue-800 font-medium mb-2">Instructions:</h3>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• <strong>Test Environment:</strong> Checks if environment variables are loaded correctly</li>
            <li>• <strong>Test WhatsApp API:</strong> Sends a test request to the WhatsApp API</li>
            <li>• <strong>Test All:</strong> Runs both tests in sequence</li>
            <li>• Check browser console for detailed logs</li>
            <li>• Check terminal/server console for API logs</li>
            <li>• Make sure your phone number includes country code (e.g., 201234567890)</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-yellow-800 font-medium mb-2">Debug Information:</h3>
          <ul className="text-yellow-600 text-sm space-y-1">
            <li>• Current time: {new Date().toLocaleString()}</li>
            <li>• User agent: {navigator.userAgent}</li>
            <li>• Window location: {window.location.href}</li>
            <li>• API endpoint: /api/notifications/whatsapp/beon</li>
            <li>• Environment endpoint: /api/test-env</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 