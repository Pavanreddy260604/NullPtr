import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types - Updated to match backend schema
export interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  thumbnail?: string;
  units?: Unit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  _id: string;
  subjectId: string;
  unit: number;
  title: string;
  subtitle?: string;
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MCQ {
  _id: string;
  subjectId: string;
  unitId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FillBlank {
  _id: string;
  subjectId: string;
  unitId: string;
  question: string;
  correctAnswer: string;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnswerBlock {
  type: 'text' | 'heading' | 'list' | 'code' | 'diagram';
  content: string;
}

export interface Descriptive {
  _id: string;
  subjectId: string;
  unitId: string;
  question: string;
  answer: AnswerBlock[];
  createdAt?: string;
  updatedAt?: string;
}

// Subject APIs
export const subjectApi = {
  getAll: () => api.get<Subject[]>('/subject'),
  getById: (id: string) => api.get<Subject>(`/subject/${id}`),
  create: (data: Omit<Subject, '_id'>) => api.post<Subject>('/subject', data),
  update: (id: string, data: Partial<Subject>) => api.put<Subject>(`/subject/${id}`, data),
  delete: (id: string) => api.delete(`/subject/${id}`),
};

// Unit APIs
export const unitApi = {
  getBySubject: (subjectId: string) => api.get<Unit[]>(`/unit/subject/${subjectId}`),
  getById: (id: string) => api.get<Unit>(`/unit/${id}`),
  create: (data: Omit<Unit, '_id'>) => api.post<Unit>('/unit', data),
  update: (id: string, data: Partial<Unit>) => api.put<Unit>(`/unit/${id}`, data),
  delete: (id: string) => api.delete(`/unit/${id}`),
};

// MCQ APIs
export const mcqApi = {
  getByUnit: (unitId: string) => api.get<MCQ[]>(`/question/mcq/unit/${unitId}`),
  create: (data: Omit<MCQ, '_id'>) => api.post<MCQ>('/question/mcq', data),
  update: (id: string, data: Partial<MCQ>) => api.put<MCQ>(`/question/mcq/${id}`, data),
  delete: (id: string) => api.delete(`/question/mcq/${id}`),
};

// Fill in the Blank APIs
export const fillBlankApi = {
  getByUnit: (unitId: string) => api.get<FillBlank[]>(`/question/fillblank/unit/${unitId}`),
  create: (data: Omit<FillBlank, '_id'>) => api.post<FillBlank>('/question/fillblank', data),
  update: (id: string, data: Partial<FillBlank>) => api.put<FillBlank>(`/question/fillblank/${id}`, data),
  delete: (id: string) => api.delete(`/question/fillblank/${id}`),
};

// Descriptive APIs
export const descriptiveApi = {
  getByUnit: (unitId: string) => api.get<Descriptive[]>(`/question/descriptive/unit/${unitId}`),
  create: (data: Omit<Descriptive, '_id'>) => api.post<Descriptive>('/question/descriptive', data),
  update: (id: string, data: Partial<Descriptive>) => api.put<Descriptive>(`/question/descriptive/${id}`, data),
  delete: (id: string) => api.delete(`/question/descriptive/${id}`),
};

// Upload API
export const uploadApi = {
  upload: (file: File, folder = 'wasa-learn/uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder); // optional field to tell backend where to store
    return api.post<{ fileUrl: string; publicId?: string }>(
      '/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};


export default api;
