/**
 * About Page
 * 
 * Information about MedNex and its capabilities
 */

'use client';

import React from 'react';
import { 
  Brain, 
  Activity, 
  Shield, 
  Users, 
  Award, 
  Zap,
  Heart,
  BookOpen,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced BioBERT NER for medical entity extraction and Groq LLaMA for conversational AI.'
    },
    {
      icon: Activity,
      title: 'Disease Prediction',
      description: 'Intelligent matching algorithms with confidence scoring across 250+ medical conditions.'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Instant symptom analysis and interactive knowledge graph visualization.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your health data stays private with local processing and secure connections.'
    }
  ];

  const stats = [
    { number: '250+', label: 'Medical Conditions', icon: Heart },
    { number: '1000+', label: 'Symptom Patterns', icon: Activity },
    { number: '99.9%', label: 'Uptime', icon: Zap },
    { number: '24/7', label: 'Availability', icon: CheckCircle }
  ];

  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Medical Advisor',
      description: 'Board-certified physician with 15+ years in digital health.'
    },
    {
      name: 'Alex Chen',
      role: 'AI Engineer',
      description: 'Machine learning expert specializing in medical NLP.'
    },
    {
      name: 'Maria Rodriguez',
      role: 'UX Designer',
      description: 'Healthcare UX specialist focused on accessible design.'
    }
  ];

  return (
    <div className="min-h-screen gradient-primary pt-24 pb-12">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white bg-opacity-20">
              <Brain className="h-16 w-16 text-white pulse-medical" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About MedNex
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            MedNex is an advanced AI-powered medical symptom checker designed to help users 
            understand potential relationships between symptoms and medical conditions through 
            cutting-edge natural language processing and machine learning.
          </p>
          
          {/* Important Disclaimer */}
          <div className="mt-8 p-6 bg-yellow-500 bg-opacity-20 rounded-xl border border-yellow-400 border-opacity-30">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Shield className="h-6 w-6 text-yellow-300" />
              <h3 className="text-lg font-semibold text-yellow-300">Important Medical Disclaimer</h3>
            </div>
            <p className="text-yellow-100 text-sm">
              MedNex is an educational tool only and should never be used for medical diagnosis 
              or as a substitute for professional medical advice. Always consult qualified 
              healthcare professionals for proper medical evaluation, diagnosis, and treatment.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Key Features</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Discover how MedNex combines artificial intelligence with medical knowledge 
            to provide comprehensive symptom analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="glass-card rounded-xl p-8 hover:bg-white hover:bg-opacity-10 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-blue-600 bg-opacity-30">
                  <feature.icon className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-white bg-opacity-20">
                    <stat.icon className="h-6 w-6 text-blue-200" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Our advanced AI pipeline processes your symptoms through multiple stages 
            to provide accurate and helpful insights.
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-center space-x-8">
            <div className="glass-card rounded-xl p-6 flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-semibold text-white">Symptom Collection</h3>
              </div>
              <p className="text-blue-100">
                Describe your symptoms in natural language through our conversational AI interface. 
                Our LLaMA-powered system asks follow-up questions for comprehensive understanding.
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-blue-300 hidden md:block" />
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="glass-card rounded-xl p-6 flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
              </div>
              <p className="text-blue-100">
                BioBERT NER extracts medical entities from your description, identifying symptoms, 
                body parts, and medical terms with high accuracy and confidence scoring.
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-blue-300 hidden md:block" />
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="glass-card rounded-xl p-6 flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-semibold text-white">Disease Matching</h3>
              </div>
              <p className="text-blue-100">
                Advanced algorithms match your symptoms against our comprehensive database 
                of 250+ medical conditions, providing confidence scores and detailed information.
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-blue-300 hidden md:block" />
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">4</div>
              <h3 className="text-xl font-semibold text-white">Interactive Visualization</h3>
            </div>
            <p className="text-blue-100">
              Explore results through our interactive D3.js knowledge graph, showing relationships 
              between symptoms, diseases, and treatments with detailed explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Frontend</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Next.js 14+ with TypeScript</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>TailwindCSS for styling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>D3.js for data visualization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Responsive design</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Backend</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>FastAPI with Python 3.10+</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>BioBERT for NER</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Groq LLaMA for AI chat</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>NetworkX for graph processing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg mb-6">
            Experience the power of AI-driven symptom analysis. Start your health journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/diagnosis"
              className="btn-professional px-8 py-3 rounded-lg font-semibold text-white text-center"
            >
              Start Diagnosis
            </a>
            <a
              href="/history"
              className="px-8 py-3 rounded-lg font-semibold text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 transition-all duration-300 text-center"
            >
              View History
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
