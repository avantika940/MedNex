// Simple API client for MedNex frontend with built-in fallbacks

// Types
export interface DiseaseResult {
  name: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'Low' | 'Medium' | 'High';
  matching_symptoms?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  follow_up: boolean;
  suggested_questions: string[];
  extracted_symptoms: string[];
  confidence: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface TermExplanation {
  term: string;
  definition?: string;
  explanation?: string;
  source?: string;
  category?: string;
  related_terms?: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'symptom' | 'disease' | 'treatment';
  group?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type?: string;
  weight?: number;
}

// Get API base URL
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

// Simple API client class
class SimpleApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return this.getFallbackData<T>(endpoint);
    }
  }

  private getFallbackData<T>(endpoint: string): T {
    if (endpoint.includes('/symptoms/extract')) {
      return {
        symptoms: ['headache', 'fever', 'fatigue'],
        entities: [],
        confidence_scores: { headache: 0.9, fever: 0.8, fatigue: 0.7 }
      } as T;
    }
    
    if (endpoint.includes('/predict')) {
      return {
        predictions: [
          {
            name: 'Common Cold',
            confidence: 75,
            description: 'A viral infection of the upper respiratory tract',
            treatment: 'Rest, fluids, and over-the-counter pain relievers',
            severity: 'Low',
            matching_symptoms: ['headache', 'fever', 'fatigue']
          },
          {
            name: 'Flu',
            confidence: 65,
            description: 'Influenza is a viral infection',
            treatment: 'Rest, antiviral medications, and fluids',
            severity: 'Medium',
            matching_symptoms: ['fever', 'fatigue']
          }
        ]
      } as T;
    }

    if (endpoint.includes('/chat')) {
      return {
        response: 'I understand you have some symptoms. Can you tell me more?',
        follow_up: true,
        suggested_questions: ['When did symptoms start?', 'How severe are they?'],
        extracted_symptoms: ['headache', 'fever'],
        confidence: 0.8
      } as T;
    }

    if (endpoint.includes('/graph')) {
      return {
        nodes: [
          { id: 'headache', label: 'Headache', type: 'symptom', group: 1 },
          { id: 'cold', label: 'Common Cold', type: 'disease', group: 2 },
        ],
        edges: [
          { source: 'headache', target: 'cold', type: 'symptom_of' }
        ]
      } as T;
    }

    if (endpoint.includes('/explain')) {
      return {
        term: 'headache',
        explanation: 'Pain or discomfort in the head area.',
        category: 'symptom',
        related_terms: ['migraine', 'tension headache']
      } as T;
    }

    return {} as T;
  }

  async extractSymptoms(text: string) {
    return this.makeRequest('/symptoms/extract', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getPredictions(symptoms: string[]): Promise<{ predictions: DiseaseResult[] }> {
    return this.makeRequest('/predict', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    });
  }

  async predictDiseases(symptoms: string[]): Promise<{ diseases: DiseaseResult[] }> {
    const result = await this.getPredictions(symptoms);
    return { diseases: result.predictions };
  }

  async chat(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        conversation_history: conversationHistory.map(msg => ({
          text: msg.content,
          is_user: msg.role === 'user'
        }))
      }),
    });
  }

  async getKnowledgeGraph(symptoms: string[]): Promise<GraphData> {
    const params = new URLSearchParams();
    symptoms.forEach(symptom => params.append('symptoms', symptom));
    return this.makeRequest(`/graph?${params.toString()}`);
  }

  async explainTerm(term: string): Promise<TermExplanation> {
    return this.makeRequest(`/explain/${encodeURIComponent(term)}`);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }
}

export const api = new SimpleApiClient();
export default api;