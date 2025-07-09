"use client";

import { useState } from 'react';

export default function TestWhatsAppFinal() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("Test User");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [otpLength, setOtpLength] = useState(4);
  const [customCode, setCustomCode] = useState("");

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    try {
      let url = "/api/notifications/whatsapp/beon";
      let body: any = { phone: phone, name: name };
      if (type === 'sms') {
        url = "/api/notifications/sms/beon";
        body = {
          phoneNumber: phone,
          name: name,
          otp_length: otpLength,
          lang: "ar",
          reference: `test_${Date.now()}`,
          custom_code: customCode
        };
      }
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">WhatsApp & SMS API Final Test</h1>
      <div className="mb-4 flex gap-2 justify-center">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="type"
            value="whatsapp"
            checked={type === 'whatsapp'}
            onChange={() => setType('whatsapp')}
          />
          WhatsApp
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="type"
            value="sms"
            checked={type === 'sms'}
            onChange={() => setType('sms')}
          />
          SMS
        </label>
      </div>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Phone Number (with country code)"
          className="border p-2 rounded w-full"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded w-full"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      {type === 'sms' && (
        <div className="mb-2 flex gap-2">
          <input
            type="number"
            min={4}
            max={8}
            placeholder="OTP Length"
            className="border p-2 rounded w-1/2"
            value={otpLength}
            onChange={e => setOtpLength(Number(e.target.value))}
          />
          <input
            type="text"
            placeholder="Custom Code (اختياري)"
            className="border p-2 rounded w-1/2"
            value={customCode}
            onChange={e => setCustomCode(e.target.value)}
          />
        </div>
      )}
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2 disabled:bg-gray-400"
      >
        {loading ? (type === 'sms' ? 'Testing SMS...' : 'Testing WhatsApp...') : (type === 'sms' ? 'Test SMS API' : 'Test WhatsApp API')}
      </button>
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">API Response:</h3>
          <pre className="text-sm mt-2 whitespace-pre-wrap break-all">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      <div className="mt-4 p-4 bg-blue-50 rounded text-xs">
        <div className="font-bold mb-1">:Current Configuration</div>
        <div>API URL: https://beon.chat/api/send/message/otp</div>
        <div>Token: (from .env)</div>
        <div>Type: {type === 'sms' ? 'SMS' : 'WhatsApp'}</div>
        <div>Language: Arabic (ar)</div>
      </div>
      <div className="mt-2 p-3 bg-yellow-50 rounded text-xs">
        <div className="font-bold mb-1">Notes:</div>
        <div>If you get "Invalid token" error, you need a valid BeOn token</div>
        <div>The template or SMS service must be approved by BeOn</div>
        <div>Check the terminal for detailed logs</div>
      </div>
    </div>
  );
} 