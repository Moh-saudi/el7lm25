'use client';

import { useEffect, useState } from 'react';

export default function TestCSPPage() {
  const [cspStatus, setCspStatus] = useState<string>('Testing...');
  const [geideaStatus, setGeideaStatus] = useState<string>('Not tested');

  useEffect(() => {
    // Test CSP by trying to load Geidea script
    const testGeideaScript = async () => {
      try {
        console.log('🧪 Testing CSP for Geidea script...');
        
        const script = document.createElement('script');
        script.src = 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js';
        script.async = true;
        script.id = 'test-geidea-script';
        
        script.onload = () => {
          console.log('✅ Geidea script loaded successfully in test');
          setGeideaStatus('✅ Script loaded successfully');
          setCspStatus('✅ CSP allows Geidea script');
        };
        
        script.onerror = (error) => {
          console.error('❌ Geidea script failed to load in test:', error);
          setGeideaStatus('❌ Script failed to load');
          setCspStatus('❌ CSP blocking Geidea script');
        };

        document.head.appendChild(script);
        
        // Remove script after test
        setTimeout(() => {
          const testScript = document.getElementById('test-geidea-script');
          if (testScript) {
            testScript.remove();
          }
        }, 5000);
        
      } catch (error) {
        console.error('❌ CSP test error:', error);
        setCspStatus('❌ CSP test failed');
      }
    };

    testGeideaScript();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CSP Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-xl font-semibold mb-2">Content Security Policy Test</h2>
          <p><strong>Status:</strong> {cspStatus}</p>
          <p><strong>Geidea Script:</strong> {geideaStatus}</p>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="text-xl font-semibold mb-2">Expected Results</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ CSP should allow Geidea script from merchant.geidea.net</li>
            <li>✅ Script should load without CSP violations</li>
            <li>✅ No console errors related to CSP</li>
          </ul>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Check browser console for CSP violations</li>
            <li>Verify middleware.js CSP configuration</li>
            <li>Check next.config.js headers configuration</li>
            <li>Ensure Geidea domains are in script-src directive</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 