/**
 * Explanation Panel Component
 * 
 * Modal panel that displays detailed explanations for medical terms,
 * including definitions, sources, and related terms.
 */

'use client';

import React from 'react';
import { X, ExternalLink, Loader2, Book } from 'lucide-react';
import { TermExplanation } from '../lib/api-simple';

interface ExplanationPanelProps {
  term: string | null;
  explanation: TermExplanation | null;
  isLoading: boolean;
  onClose: () => void;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  term,
  explanation,
  isLoading,
  onClose
}) => {
  // Don't render if no term is selected
  if (!term) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Book className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Medical Term Explanation</h2>
              <p className="text-sm text-gray-600">Educational information about "{term}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading explanation...</p>
              </div>
            </div>
          ) : explanation ? (
            <div className="space-y-6">
              {/* Term Name */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 capitalize mb-2">
                  {explanation.term}
                </h3>
              </div>

              {/* Definition */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Definition</h4>
                <p className="text-gray-600 leading-relaxed">
                  {explanation.definition}
                </p>
              </div>

              {/* Related Terms */}
              {explanation.related_terms && explanation.related_terms.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Related Terms</h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.related_terms.map((relatedTerm, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                        onClick={() => {
                          // You could implement navigation to related terms here
                          console.log(`Navigate to term: ${relatedTerm}`);
                        }}
                      >
                        {relatedTerm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Source</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{explanation.source}</span>
                  {explanation.source !== 'System' && (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Educational Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Educational Purpose Only</h4>
                <p className="text-blue-700 text-sm">
                  This information is provided for educational purposes and general awareness. 
                  It should not be used for self-diagnosis or as a substitute for professional 
                  medical advice. Always consult with qualified healthcare professionals for 
                  medical concerns.
                </p>
              </div>

              {/* Additional Resources */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Need More Information?</h4>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">
                    For comprehensive medical information, consider consulting:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Your primary healthcare provider</li>
                    <li>• Medical professionals specializing in related conditions</li>
                    <li>• Reputable medical websites (Mayo Clinic, WebMD, Healthline)</li>
                    <li>• Medical literature and research publications</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Book className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Explanation Available</h3>
                <p>
                  We couldn't find detailed information about "{term}" at this time. 
                  Please consult healthcare professionals for accurate medical information.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              This information is for educational purposes only
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;
