/**
 * Chat Interface Component
 * 
 * Provides conversational UI for symptom collection using Groq LLaMA AI.
 * Features message bubbles, typing animation, and suggested questions.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { ChatMessage, ChatResponse, ApiError } from '../lib/types';

interface ChatInterfaceProps {
  onSymptomsUpdate: (symptoms: string[]) => void;
  onPredictionsUpdate: (predictions: any[], originalQuery?: string, currentSymptoms?: string[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSymptomsUpdate, 
  onPredictionsUpdate 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help you understand your symptoms. Please describe how you\'re feeling, and I\'ll ask some follow-up questions to better understand your condition. Remember, this is for educational purposes only and not a substitute for professional medical advice.',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Send message to AI and handle response
   */
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    
    if (!messageToSend || isLoading) return;

    setError(null);
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Add to conversation history for saving
    setConversationHistory(prev => [...prev, messageToSend]);

    try {
      // Send to chat API
      const response: ChatResponse = await api.chat(messageToSend, messages);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setSuggestedQuestions(response.suggested_questions);
      
      // Update accumulated symptoms
      const newSymptoms = [...new Set([...allSymptoms, ...response.extracted_symptoms])];
      setAllSymptoms(newSymptoms);
      onSymptomsUpdate(newSymptoms);
      
      // If we have enough symptoms, get predictions
      if (newSymptoms.length >= 2) {
        try {
          const predictions = await api.predictDiseases(newSymptoms);
          // Pass a summary of the conversation as the original query
          const conversationSummary = conversationHistory.slice(-3).join(' | '); // Last 3 messages
          onPredictionsUpdate(predictions.diseases, conversationSummary || messageToSend, newSymptoms);
        } catch (predictionError) {
          console.warn('Failed to get predictions:', predictionError);
        }
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to send message');
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your message right now. Please try again, or if the problem persists, consider consulting a healthcare professional directly.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle suggested question click
   */
  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  /**
   * Handle Enter key in textarea
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Clear conversation
   */
  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m here to help you understand your symptoms. Please describe how you\'re feeling, and I\'ll ask some follow-up questions to better understand your condition. Remember, this is for educational purposes only and not a substitute for professional medical advice.',
        timestamp: new Date().toISOString()
      }
    ]);
    setAllSymptoms([]);
    setSuggestedQuestions([]);
    setError(null);
    setConversationHistory([]);
    onSymptomsUpdate([]);
    onPredictionsUpdate([]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-blue-50 rounded-t-lg">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">AI Symptom Assistant</h2>
          <p className="text-sm text-gray-700">Describe your symptoms naturally</p>
        </div>
        <button
          onClick={handleClearChat}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-4'
                  : 'bg-gray-100 text-gray-800 mr-4'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.timestamp && (
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 mr-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-gray-700">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <p className="text-sm text-gray-700 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Symptoms Summary */}
        {allSymptoms.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">Identified symptoms:</p>
            <div className="flex flex-wrap gap-1">
              {allSymptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 mt-2 text-center">
          This is an educational tool, not a medical diagnostic system. Always consult healthcare professionals for medical advice.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
