/**
 * MedNex Main Page
 * 
 * AI-Powered Medical Symptom Checker with Knowledge Graph Visualization
 * This is the main application page that combines all components.
 */

'use client';

import React, { useState } from 'react';
import { Brain, Shield, AlertTriangle } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import KnowledgeGraph from '../components/KnowledgeGraph';
import ResultsDisplay from '../components/ResultsDisplay';
import ExplanationPanel from '../components/ExplanationPanel';
import { api } from '../lib/api';
import { DiseaseResult, TermExplanation } from '../lib/types';

export default function Home() {
  // Application state
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<DiseaseResult[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<TermExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  /**
   * Handle symptom updates from chat interface
   */
  const handleSymptomsUpdate = (newSymptoms: string[]) => {
    setSymptoms(newSymptoms);
  };

  /**
   * Handle prediction updates from chat interface
   */
  const handlePredictionsUpdate = (newPredictions: DiseaseResult[]) => {
    setPredictions(newPredictions);
  };

  /**
   * Handle term explanation requests
   */
  const handleExplainTerm = async (term: string) => {
    setSelectedTerm(term);
    setIsLoadingExplanation(true);
    setExplanation(null);

    try {
      const termExplanation = await api.explainTerm(term);
      setExplanation(termExplanation);
    } catch (error) {
      console.error('Error explaining term:', error);
      // Set a fallback explanation
      setExplanation({
        term,
        definition: `Information about "${term}" is not available at this time. Please consult healthcare professionals for accurate medical information.`,
        source: 'System',
        related_terms: []
      });
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  /**
   * Close explanation panel
   */
  const handleCloseExplanation = () => {
    setSelectedTerm(null);
    setExplanation(null);
    setIsLoadingExplanation(false);
  };

  // Extract disease names for graph visualization
  const diseaseNames = predictions.map(p => p.name);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedNex</h1>
                <p className="text-sm text-gray-600">AI-Powered Medical Symptom Checker</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Educational Tool Only</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Disclaimer */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Medical Disclaimer</p>
              <p>
                MedNex is an educational tool designed to help you understand potential relationships 
                between symptoms and medical conditions. It is NOT a diagnostic tool and should never 
                replace professional medical advice. Always consult qualified healthcare professionals 
                for proper medical evaluation, diagnosis, and treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Application Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Chat Interface */}
          <div className="h-[600px]">
            <ChatInterface
              onSymptomsUpdate={handleSymptomsUpdate}
              onPredictionsUpdate={handlePredictionsUpdate}
            />
          </div>

          {/* Right Column - Results Display */}
          <div className="h-[600px] overflow-y-auto">
            <ResultsDisplay
              predictions={predictions}
              isLoading={false}
              onExplainTerm={handleExplainTerm}
            />
          </div>
        </div>

        {/* Bottom Row - Knowledge Graph */}
        <div className="w-full">
          <KnowledgeGraph
            symptoms={symptoms}
            diseases={diseaseNames}
            className="h-[500px]"
          />
        </div>

        {/* Feature Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600 text-sm">
              Uses advanced BioBERT NER and Groq LLaMA models to extract symptoms and provide 
              conversational interaction for better understanding of your health concerns.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Graph</h3>
            <p className="text-gray-600 text-sm">
              Interactive D3.js visualization showing relationships between symptoms, diseases, 
              and treatments to help you understand medical connections.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Focus</h3>
            <p className="text-gray-600 text-sm">
              Designed purely for educational purposes with clear disclaimers and emphasis on 
              the importance of professional medical consultation for health concerns.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p className="mb-2">
              &copy; 2024 MedNex. Built with Next.js, FastAPI, BioBERT, and Groq LLaMA.
            </p>
            <p>
              This is an educational project. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Explanation Panel Modal */}
      <ExplanationPanel
        term={selectedTerm}
        explanation={explanation}
        isLoading={isLoadingExplanation}
        onClose={handleCloseExplanation}
      />
    </div>
  );
}
