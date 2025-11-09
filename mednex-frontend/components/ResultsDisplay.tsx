/**
 * Results Display Component
 * 
 * Shows disease predictions with confidence scores, descriptions, and treatments.
 * Features expandable sections and confidence-based color coding.
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { DiseaseResult, CONFIDENCE_LEVELS } from '../lib/types';

interface ResultsDisplayProps {
  predictions: DiseaseResult[];
  isLoading: boolean;
  onExplainTerm: (term: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  predictions,
  isLoading,
  onExplainTerm
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  /**
   * Toggle expanded state for a prediction item
   */
  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  /**
   * Get confidence level configuration based on score
   */
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= CONFIDENCE_LEVELS.HIGH.min) return CONFIDENCE_LEVELS.HIGH;
    if (confidence >= CONFIDENCE_LEVELS.MEDIUM.min) return CONFIDENCE_LEVELS.MEDIUM;
    return CONFIDENCE_LEVELS.LOW;
  };

  /**
   * Get confidence bar width percentage
   */
  const getConfidenceWidth = (confidence: number) => {
    return Math.min(confidence, 100);
  };

  if (predictions.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-gray-600">
          <Info className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-medium mb-2 text-gray-800">Disease Predictions</h3>
          <p className="text-gray-700">Chat with the AI to get disease predictions based on your symptoms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Disease Predictions</h2>
            <p className="text-sm text-gray-700">Based on your reported symptoms</p>
          </div>
          {predictions.length > 0 && (
            <div className="text-sm text-gray-600">
              {predictions.length} prediction{predictions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700">Analyzing symptoms and generating predictions...</p>
        </div>
      )}

      {/* Predictions List */}
      <div className="divide-y divide-gray-200">
        {predictions.map((prediction, index) => {
          const isExpanded = expandedItems.has(index);
          const confidenceLevel = getConfidenceLevel(prediction.confidence);

          return (
            <div key={index} className="p-4">
              {/* Prediction Header */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-800">{prediction.name}</h3>
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${confidenceLevel.color}20`,
                        color: confidenceLevel.color 
                      }}
                    >
                      {confidenceLevel.label} Confidence
                    </span>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getConfidenceWidth(prediction.confidence)}%`,
                            backgroundColor: confidenceLevel.color
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {prediction.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {prediction.description}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExplainTerm(prediction.name);
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Learn more about {prediction.name} →
                    </button>
                  </div>

                  {/* Treatment */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Recommended Actions</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {prediction.treatment}
                    </p>
                  </div>

                  {/* Matching Symptoms */}
                  {prediction.matching_symptoms && prediction.matching_symptoms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Matching Symptoms</h4>
                      <div className="flex flex-wrap gap-2">
                        {prediction.matching_symptoms.map((symptom, symIndex) => (
                          <span
                            key={symIndex}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Severity */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Severity Level</h4>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          prediction.severity === 'High' 
                            ? 'bg-red-100 text-red-800'
                            : prediction.severity === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {prediction.severity}
                      </span>
                      {prediction.severity === 'High' && (
                        <span className="text-sm text-red-600">
                          Consider seeking medical attention promptly
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-4 border-t bg-amber-50">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important Medical Disclaimer</p>
            <p>
              These predictions are for educational purposes only and should not be used for 
              medical diagnosis. Always consult qualified healthcare professionals for proper 
              medical evaluation and treatment. If you have severe symptoms or a medical 
              emergency, seek immediate medical attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
