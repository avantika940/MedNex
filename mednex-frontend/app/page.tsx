/**
 * MedNex Main Page
 * 
 * AI-Powered Medical Symptom Checker with Knowledge Graph Visualization
 * This is the main application page that combines all components.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Shield, AlertTriangle, Activity, LogIn } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);  return (
    <div className="min-h-screen gradient-medical pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-4 rounded-full glass-card">
                  <Brain className="h-16 w-16 text-white pulse-medical" />
                </div>
                <div className="absolute -inset-2 bg-white rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 float-animation">
              AI-Powered Health Analysis
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Describe your symptoms and get intelligent insights using advanced medical AI
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/diagnosis"
                    className="btn-professional px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                  >
                    Get Started with AI Diagnosis
                  </Link>
                  <Link
                    href="/history"
                    className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-block bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50"
                  >
                    View My History
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-professional px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login to Get Started</span>
                  </Link>
                  <div className="text-gray-600 text-sm max-w-md">
                    <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-600" />
                    Please login to access AI diagnosis and track your history
                  </div>
                </>
              )}
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="glass-card rounded-xl p-4">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-gray-800 font-semibold">BioBERT NER</h3>
                <p className="text-gray-600 text-sm">Advanced medical entity extraction</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-gray-800 font-semibold">250+ Conditions</h3>
                <p className="text-gray-600 text-sm">Comprehensive disease database</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-gray-800 font-semibold">Privacy First</h3>
                <p className="text-gray-600 text-sm">Your data stays secure</p>
              </div>
            </div>
            
            {/* Important Disclaimer */}
            <div className="glass-card rounded-xl p-6 max-w-4xl mx-auto border border-yellow-600 border-opacity-50">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-700" />
                <span className="text-lg font-semibold text-yellow-800">Important Medical Disclaimer</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                MedNex is an educational tool designed to help you understand potential relationships 
                between symptoms and medical conditions. It is NOT a diagnostic tool and should never 
                replace professional medical advice. Always consult qualified healthcare professionals 
                for proper medical evaluation, diagnosis, and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Feature Cards with Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Start Diagnosis Card */}
          <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 rounded-full bg-blue-600 bg-opacity-20 group-hover:bg-opacity-30 transition-colors">
                <Activity className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Start Diagnosis</h3>
                <p className="text-gray-600">AI-powered symptom analysis</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Describe your symptoms in natural language to our AI assistant. Get instant analysis 
              using BioBERT NER for medical entity extraction and receive potential condition matches 
              with confidence scores.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Conversational AI interface</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Real-time symptom extraction</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Confidence-based predictions</span>
              </div>
            </div>
            <a
              href="/diagnosis"
              className="btn-professional w-full py-3 px-6 text-white font-semibold rounded-lg text-center block hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              Start Diagnosis Analysis
            </a>
          </div>

          {/* View History Card */}
          <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 rounded-full bg-purple-600 bg-opacity-20 group-hover:bg-opacity-30 transition-colors">
                <Brain className="h-12 w-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Search History</h3>
                <p className="text-gray-600">Track your health journey</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Access your complete diagnosis history with detailed analytics. Filter searches, 
              export data, and track confidence trends to monitor your health insights over time.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Complete search history</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Analytics and insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Export and import data</span>
              </div>
            </div>
            <a
              href="/history"
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg text-center block hover:from-purple-700 hover:to-purple-800 hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              View Search History
            </a>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="glass-card rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">How MedNex Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-blue-100">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Describe Symptoms</h3>
              <p className="text-gray-600">
                Use natural language to describe your symptoms. Our AI understands context 
                and asks follow-up questions for clarity.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-green-100">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                BioBERT extracts medical entities while Groq LLaMA provides conversational 
                understanding and matches symptoms to conditions.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-purple-100">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Visual Results</h3>
              <p className="text-gray-600">
                Get confidence-scored predictions with interactive knowledge graphs 
                showing relationships between symptoms and conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Quick Actions</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/about"
              className="px-6 py-3 bg-white bg-opacity-20 text-gray-700 rounded-lg border border-gray-300 hover:bg-opacity-30 transition-all duration-300"
            >
              Learn More About MedNex
            </a>
            {isLoggedIn && (
              <a
                href="/settings"
                className="px-6 py-3 bg-white bg-opacity-20 text-gray-700 rounded-lg border border-gray-300 hover:bg-opacity-30 transition-all duration-300"
              >
                App Settings
              </a>
            )}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="glass-card rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Powered by Advanced AI Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-blue-100">
                  <Brain className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">BioBERT NER</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Advanced Named Entity Recognition trained on biomedical literature for 
                precise symptom and medical term extraction.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-green-100">
                  <Activity className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Groq LLaMA AI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Conversational AI for natural symptom collection and intelligent 
                medical reasoning with context understanding.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-purple-100">
                  <Shield className="h-10 w-10 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">D3.js Visualization</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Interactive knowledge graphs showing complex relationships between 
                symptoms, diseases, and medical concepts.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Preview Section */}
        <div className="glass-card rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">See MedNex in Action</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Interactive AI Conversation</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-sm text-gray-700 mb-1"><strong>You:</strong></p>
                  <p className="text-gray-800">"I've been having a headache for 3 days, feeling dizzy, and have a slight fever."</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                  <p className="text-sm text-gray-700 mb-1"><strong>AI Assistant:</strong></p>
                  <p className="text-gray-800">"I understand you're experiencing headache, dizziness, and fever. Can you tell me more about the intensity of your headache and when the fever started?"</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                  <p className="text-sm text-gray-700 mb-1"><strong>Analysis Result:</strong></p>
                  <p className="text-gray-800">• Viral Infection (85% confidence)<br/>• Tension Headache (72% confidence)<br/>• Migraine (68% confidence)</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="h-16 w-16 text-blue-600 pulse-medical" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Real-time Processing</h4>              <p className="text-gray-600 text-sm">
                Our AI processes your symptoms instantly, extracting medical entities 
                and providing confidence-scored predictions based on a comprehensive 
                database of 250+ medical conditions.
              </p>
                <div className="mt-6">
                  <a
                    href="/diagnosis"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-block"
                  >
                    Try It Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">250+</div>
            <div className="text-gray-600 text-sm">Medical Conditions</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600 text-sm">Accuracy Rate</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">&lt;5s</div>
            <div className="text-gray-600 text-sm">Response Time</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Available</div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="glass-card rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Why Choose MedNex?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Instant Analysis</h3>
                  <p className="text-gray-600 text-sm">Get immediate insights without waiting for appointments or long queues.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Educational Focus</h3>
                  <p className="text-gray-600 text-sm">Learn about potential conditions and their relationships with your symptoms.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Privacy Protected</h3>
                  <p className="text-gray-600 text-sm">Your health data is processed securely and never shared with third parties.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Always Available</h3>
                  <p className="text-gray-600 text-sm">Access AI-powered health insights anytime, anywhere, 24/7.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Visual Understanding</h3>
                  <p className="text-gray-600 text-sm">Interactive knowledge graphs help visualize symptom-disease relationships.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Continuous Learning</h3>
                  <p className="text-gray-600 text-sm">AI models trained on latest medical literature and continuously updated.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="glass-card mt-12 rounded-t-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-700 text-sm">
            <p className="mb-2 font-medium">
              &copy; 2025 MedNex. Built with Next.js, FastAPI, BioBERT, and Groq LLaMA.
            </p>
            <p className="text-gray-600">
              This is an educational project. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
