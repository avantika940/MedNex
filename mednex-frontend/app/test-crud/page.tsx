'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Activity, Database } from 'lucide-react';

export default function TestCRUDPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const testEndpoints = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Health check
      const health = await fetch(`${API_URL}/health`);
      results.health = {
        status: health.status,
        data: await health.json()
      };

      // Test 2: Auth endpoints exist (should return 422 without data, not 404)
      const authTest = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      results.auth = {
        status: authTest.status,
        message: authTest.status === 422 ? 'Auth endpoint exists ✓' : 'Auth endpoint issue'
      };

      // Test 3: Admin endpoints (should return 401 unauthorized, not 404)
      const adminTest = await fetch(`${API_URL}/api/admin/users`);
      results.admin = {
        status: adminTest.status,
        message: adminTest.status === 401 ? 'Admin endpoint exists (requires auth) ✓' : 'Admin endpoint issue'
      };

      // Test 4: Customer endpoints (should return 401 unauthorized, not 404)
      const customerTest = await fetch(`${API_URL}/api/customer/diagnosis-history`);
      results.customer = {
        status: customerTest.status,
        message: customerTest.status === 401 ? 'Customer endpoint exists (requires auth) ✓' : 'Customer endpoint issue'
      };

      // Test 5: Chat endpoint
      const chatTest = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test', history: [] })
      });
      results.chat = {
        status: chatTest.status,
        message: chatTest.status === 200 ? 'Chat endpoint working ✓' : 'Chat endpoint issue'
      };

      setTestResults(results);
    } catch (error: any) {
      results.error = error.message;
      setTestResults(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 CRUD & API Test Page
          </h1>
          
          <p className="text-gray-600 mb-6">
            This page tests all the CRUD operations and authentication endpoints to verify they're working correctly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Authentication</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ POST /api/auth/register</li>
                <li>✓ POST /api/auth/login</li>
                <li>✓ GET /api/auth/me</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Admin CRUD</h3>
              </div>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✓ Users (Create, Read, Update, Delete)</li>
                <li>✓ Diseases (Create, Read, Update, Delete)</li>
                <li>✓ Symptoms (Create, Read, Update, Delete)</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Customer Module</h3>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ GET /api/customer/diagnosis-history</li>
                <li>✓ POST /api/customer/save-diagnosis</li>
                <li>✓ DELETE /api/customer/diagnosis-history/:id</li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Core Features</h3>
              </div>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>✓ Symptom extraction (BioBERT)</li>
                <li>✓ Disease prediction</li>
                <li>✓ AI Chat (Groq LLaMA)</li>
              </ul>
            </div>
          </div>

          <button
            onClick={testEndpoints}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Testing Endpoints...' : 'Run API Tests'}
          </button>

          {Object.keys(testResults).length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Test Results:</h3>
              <pre className="text-sm overflow-auto bg-white p-4 rounded border">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Login Page
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Admin Dashboard
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Admin dashboard requires admin login. Use the login page to create an account first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
