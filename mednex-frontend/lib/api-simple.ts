// Simple API client for MedNex frontend with built-in fallbacks

// Types
export interface DiseaseResult {
  disease: string;
  confidence: number;
  description?: string;
  symptoms: string[];
  treatments?: string[];
  category?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface ChatResponse {
  response: string;
  follow_up_questions?: string[];
  extracted_symptoms?: string[];
  confidence?: number;
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
            disease: 'Common Cold',
            confidence: 75,
            description: 'A viral infection of the upper respiratory tract',
            symptoms: ['headache', 'fever', 'fatigue'],
            treatments: ['Rest', 'Fluids', 'Over-the-counter pain relievers'],
            category: 'Respiratory'
          }
        ]
      } as T;
    }

    if (endpoint.includes('/chat')) {
      return {
        response: 'I understand you have some symptoms. Can you tell me more?',
        follow_up_questions: ['When did symptoms start?', 'How severe are they?'],
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

  async chat(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        conversation_history: conversationHistory.map(msg => ({
          text: msg.text,
          is_user: msg.isUser
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