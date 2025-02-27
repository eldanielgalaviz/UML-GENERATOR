// src/services/api.service.ts

import axios from 'axios';

interface IEEE830Requirement {
  id: string;
  type: 'functional' | 'non-functional';
  description: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

interface MermaidDiagram {
  type: string;
  title: string;
  code: string;
}

interface AnalysisResponse {
  requirements: IEEE830Requirement[];
  diagrams: MermaidDiagram[];
}

interface GeneratedCode {
  backend: any;
  frontend: any;
}

const API_URL = 'http://localhost:3000/api'; // Ajusta según tu configuración

export const analyzeRequirements = async (requirements: string): Promise<AnalysisResponse> => {
  try {
    const response = await axios.post(`${API_URL}/gemini/analyze`, {
      requirements
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing requirements:', error);
    throw error;
  }
};

export const generateCode = async (
  diagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): Promise<GeneratedCode> => {
  try {
    const response = await axios.post(`${API_URL}/gemini/generate-code`, {
      diagrams,
      requirements
    });
    return response.data;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};