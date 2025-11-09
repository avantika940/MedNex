/**
 * TypeScript type definitions for MedNex application
 */

// API Response Types
export interface SymptomExtractionResponse {
  symptoms: string[];
  entities: MedicalEntity[];
  confidence_scores: Record<string, number>;
}

export interface MedicalEntity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

export interface DiseaseResult {
  name: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'Low' | 'Medium' | 'High';
  matching_symptoms?: string[];
}

export interface PredictionResponse {
  diseases: DiseaseResult[];
  total_symptoms: number;
  processing_time: number;
}

// Graph Types
export interface GraphNode {
  id: string;
  label: string;
  type: 'symptom' | 'disease' | 'treatment';
  size: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    total_nodes: number;
    total_edges: number;
    symptom_nodes: number;
    disease_nodes: number;
    treatment_nodes: number;
    avg_degree: number;
    density: number;
    connected_components: number;
  };
}

// Chat Types
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

// API Request Types
export interface SymptomRequest {
  text: string;
}

export interface PredictionRequest {
  symptoms: string[];
}

export interface GraphRequest {
  symptoms: string[];
  diseases: string[];
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

// Component Props Types
export interface ChatInterfaceProps {
  onSymptomsUpdate: (symptoms: string[]) => void;
  onPredictionsUpdate: (predictions: DiseaseResult[]) => void;
}

export interface KnowledgeGraphProps {
  symptoms: string[];
  diseases: string[];
  className?: string;
}

export interface ResultsDisplayProps {
  predictions: DiseaseResult[];
  isLoading: boolean;
  onExplainTerm: (term: string) => void;
}

export interface ExplanationPanelProps {
  term: string | null;
  explanation: TermExplanation | null;
  isLoading: boolean;
  onClose: () => void;
}

// Explanation Types
export interface TermExplanation {
  term: string;
  definition?: string;
  explanation?: string;
  source?: string;
  related_terms?: string[];
}

// Application State
export interface AppState {
  symptoms: string[];
  predictions: DiseaseResult[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  selectedTerm: string | null;
  explanation: TermExplanation | null;
}

// API Error Response
export interface ApiError {
  error: string;
  message: string;
  disclaimer?: string;
}

// Constants
export const CONFIDENCE_LEVELS = {
  HIGH: { min: 70, max: 100, label: 'High', color: 'text-green-600' },
  MEDIUM: { min: 40, max: 69, label: 'Medium', color: 'text-yellow-600' },
  LOW: { min: 0, max: 39, label: 'Low', color: 'text-red-600' }
} as const;

export const NODE_TYPES = {
  SYMPTOM: 'symptom',
  DISEASE: 'disease',
  TREATMENT: 'treatment'
} as const;

export const API_ENDPOINTS = {
  EXTRACT_SYMPTOMS: '/api/extract_symptoms',
  PREDICT: '/api/predict',
  GRAPH: '/api/graph',
  CHAT: '/api/chat',
  EXPLAIN: '/api/explain'
} as const;
