/**
 * Diagnosis Page
 * 
 * Focused diagnosis interface with enhanced features
 * PROTECTED ROUTE - Requires authentication
 */

'use client';

import React, { useState } from 'react';
import { Brain, Activity, AlertTriangle, Shield } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import ResultsDisplay from '@/components/ResultsDisplay';
import ExplanationPanel from '@/components/ExplanationPanel';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { DiseaseResult, TermExplanation } from '@/lib/types';
import { saveDiagnosis } from '@/lib/customer-api';
import { isAuthenticated } from '@/lib/auth';

function DiagnosisPageContent() {
  // Application state
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<DiseaseResult[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<TermExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // Save to backend API when predictions are made
  const saveToHistory = async (originalQuery: string, symptoms: string[], predictions: DiseaseResult[]) => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('User not authenticated - skipping history save');
      return;
    }
    
    try {
      // Save to backend API
      await saveDiagnosis(symptoms, predictions);
      console.log('Diagnosis saved to backend successfully');
    } catch (error) {
      console.error('Failed to save diagnosis to backend:', error);
      // Silently fail - don't interrupt user flow
    }
  };

  /**
   * Handle symptom updates from chat interface
   */
  const handleSymptomsUpdate = (newSymptoms: string[]) => {
    setSymptoms(newSymptoms);
  };

  /**
   * Handle prediction updates from chat interface
   */
  const handlePredictionsUpdate = (newPredictions: DiseaseResult[], originalQuery?: string, currentSymptoms?: string[]) => {
    setPredictions(newPredictions);
    
    // Use passed symptoms or fall back to state symptoms
    const symptomsToUse = currentSymptoms || symptoms;
    
    // Save to history if we have predictions and symptoms
    if (newPredictions.length > 0 && symptomsToUse.length > 0 && originalQuery) {
      saveToHistory(originalQuery, symptomsToUse, newPredictions);
    }
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
    <div className="min-h-screen gradient-secondary pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full glass-card">
              <Activity className="h-12 w-12 text-white pulse-medical" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Medical Diagnosis Assistant
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Describe your symptoms for AI-powered analysis and insights
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="glass-card rounded-xl p-6 mb-8 border border-yellow-400 border-opacity-30">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-300" />
            <span className="font-semibold text-yellow-300">Medical Disclaimer</span>
          </div>
          <p className="text-yellow-100 text-sm text-center">
            This tool provides educational information only. Always consult healthcare professionals for medical diagnosis and treatment.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Getting Started Banner - Show when no symptoms yet */}
        {symptoms.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-blue-600 bg-opacity-20">
                  <Brain className="h-12 w-12 text-blue-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Analysis?</h3>
              <p className="text-blue-100 mb-6">
                Describe your symptoms in natural language to our AI assistant. 
                Be as detailed as possible for the most accurate analysis.
              </p>
              <div className="text-blue-200 text-sm">
                💡 <strong>Example:</strong> "I've been having a headache for 3 days, feeling dizzy, and have a slight fever."
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout - Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Chat Interface */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-blue-200" />
                <h2 className="text-xl font-bold text-white">AI Symptom Assistant</h2>
              </div>
              {symptoms.length > 0 && (
                <div className="text-sm text-blue-200">
                  {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} identified
                </div>
              )}
            </div>
            <div className="h-[600px]">
              <ChatInterface
                onSymptomsUpdate={handleSymptomsUpdate}
                onPredictionsUpdate={handlePredictionsUpdate}
              />
            </div>
          </div>

          {/* Right Column - Results Display */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-green-200" />
                <h2 className="text-xl font-bold text-white">Analysis Results</h2>
              </div>
              {predictions.length > 0 && (
                <div className="text-sm text-blue-200">
                  {predictions.length} prediction{predictions.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="h-[600px] overflow-y-auto">
              {predictions.length === 0 && symptoms.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Activity className="h-16 w-16 text-blue-300 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white mb-2">Waiting for Analysis</h3>
                    <p className="text-blue-200 text-sm">
                      Start describing your symptoms in the chat to see AI-powered predictions here
                    </p>
                  </div>
                </div>
              ) : (
                <ResultsDisplay
                  predictions={predictions}
                  isLoading={false}
                  onExplainTerm={handleExplainTerm}
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Insights Row */}
        {(symptoms.length > 0 || predictions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Symptoms Summary */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Identified Symptoms</h3>
              {symptoms.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {symptoms.slice(0, 5).map((symptom, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-blue-100 text-sm">{symptom}</span>
                    </div>
                  ))}
                  {symptoms.length > 5 && (
                    <div className="text-blue-200 text-xs mt-2">
                      +{symptoms.length - 5} more symptoms
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-blue-200 text-sm">Start chatting to identify symptoms</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
              {predictions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 text-sm">Top Match</span>
                    <span className="text-white font-medium text-sm">
                      {predictions[0]?.confidence}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 text-sm">Total Matches</span>
                    <span className="text-white font-medium text-sm">{predictions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 text-sm">Avg Confidence</span>
                    <span className="text-white font-medium text-sm">
                      {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-blue-200 text-sm">Analysis will appear here after describing symptoms</p>
              )}
            </div>

            {/* Tips */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💡 Tips</h3>
              <div className="space-y-2 text-blue-100 text-sm">
                <p>• Be specific about symptoms</p>
                <p>• Include duration & severity</p>
                <p>• Mention triggers or patterns</p>
                <p>• Ask follow-up questions</p>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Graph Section - Only show when there are results */}
        {symptoms.length > 0 && predictions.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-purple-200" />
                <h2 className="text-xl font-bold text-white">Knowledge Graph</h2>
              </div>
              <div className="text-sm text-blue-200">
                Visualizing {symptoms.length} symptoms & {diseaseNames.length} conditions
              </div>
            </div>
            <KnowledgeGraph
              symptoms={symptoms}
              diseases={diseaseNames}
              className="h-[400px]"
            />
            <div className="mt-4 text-center">
              <p className="text-blue-200 text-sm">
                Interactive graph showing relationships between your symptoms and potential conditions
              </p>
            </div>
          </div>
        )}
      </div>

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

// Wrap with ProtectedRoute to require authentication
export default function DiagnosisPage() {
  return (
    <ProtectedRoute>
      <DiagnosisPageContent />
    </ProtectedRoute>
  );
}
