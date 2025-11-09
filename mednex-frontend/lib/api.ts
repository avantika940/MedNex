/**
 * API Client for MedNex Backend
 * 
 * This module provides functions to interact with the MedNex FastAPI backend,
 * handling symptom extraction, disease prediction, graph generation, and chat functionality.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  SymptomRequest,
  SymptomExtractionResponse,
  PredictionRequest,
  PredictionResponse,
  GraphRequest,
  GraphData,
  ChatRequest,
  ChatResponse,
  ChatMessage,
  TermExplanation,
  ApiError
} from './types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        
        // Transform error to standard format
        const apiError: ApiError = {
          error: error.response?.data?.error || 'Network Error',
          message: error.response?.data?.message || 'Failed to connect to server',
          disclaimer: error.response?.data?.disclaimer
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Extract symptoms from user text using BioBERT NER
   * @param text User's symptom description
   * @returns Promise with extracted symptoms and entities
   */
  async extractSymptoms(text: string): Promise<SymptomExtractionResponse> {
    try {
      const request: SymptomRequest = { text };
      const response = await this.client.post<SymptomExtractionResponse>(
        '/api/extract_symptoms',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error extracting symptoms:', error);
      throw error;
    }
  }

  /**
   * Predict diseases based on symptoms
   * @param symptoms Array of symptom strings
   * @returns Promise with disease predictions
   */
  async predictDiseases(symptoms: string[]): Promise<PredictionResponse> {
    try {
      const request: PredictionRequest = { symptoms };
      const response = await this.client.post<PredictionResponse>(
        '/api/predict',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error predicting diseases:', error);
      throw error;
    }
  }

  /**
   * Generate knowledge graph for symptoms and diseases
   * @param symptoms Array of symptoms
   * @param diseases Array of diseases
   * @returns Promise with graph data
   */
  async generateGraph(symptoms: string[], diseases: string[]): Promise<GraphData> {
    try {
      const request: GraphRequest = { symptoms, diseases };
      const response = await this.client.post<GraphData>(
        '/api/graph',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error generating graph:', error);
      throw error;
    }
  }

  /**
   * Chat with AI for conversational symptom collection
   * @param message User's message
   * @param history Previous chat history
   * @returns Promise with AI response
   */
  async chat(message: string, history: ChatMessage[]): Promise<ChatResponse> {
    try {
      const request: ChatRequest = { message, history };
      const response = await this.client.post<ChatResponse>(
        '/api/chat',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Get explanation for a medical term
   * @param term Medical term to explain
   * @returns Promise with term explanation
   */
  async explainTerm(term: string): Promise<TermExplanation> {
    try {
      const response = await this.client.get<TermExplanation>(
        `/api/explain/${encodeURIComponent(term)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error explaining term:', error);
      throw error;
    }
  }

  /**
   * Health check to verify API connection
   * @returns Promise with health status
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get API information
   * @returns Promise with API info
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      console.error('Error getting API info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility functions
export const api = {
  extractSymptoms: (text: string) => apiClient.extractSymptoms(text),
  predictDiseases: (symptoms: string[]) => apiClient.predictDiseases(symptoms),
  generateGraph: (symptoms: string[], diseases: string[]) => 
    apiClient.generateGraph(symptoms, diseases),
  chat: (message: string, history: ChatMessage[]) => 
    apiClient.chat(message, history),
  explainTerm: (term: string) => apiClient.explainTerm(term),
  healthCheck: () => apiClient.healthCheck(),
  getApiInfo: () => apiClient.getApiInfo()
};

export default api;
