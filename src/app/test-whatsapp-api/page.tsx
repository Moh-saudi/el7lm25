"use client";

import { useState } from 'react';

export default function TestWhatsAppAPI() {
  const [phone, setPhone] = useState('201234567890');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing WhatsApp API with:', { phone, name });
      
      const response = await fetch('/api/notifications/whatsapp/beon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, name }),
      });

      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error occurred');
        setResult(data);
      }
    } catch (err: any) {
      console.error('Test error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">WhatsApp API Test</h1>
        
        <div className="space-y-4">
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
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test WhatsApp API'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium">Error:</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-gray-800 font-medium">Result:</h3>
            <pre className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-blue-800 font-medium">Instructions:</h3>
          <ul className="text-blue-600 mt-2 text-sm space-y-1">
            <li>• Enter a valid phone number with country code (e.g., 201234567890)</li>
            <li>• Check the browser console for detailed logs</li>
            <li>• Check the terminal/server console for API logs</li>
            <li>• The API will attempt to send a WhatsApp OTP link</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 