import axios from "axios";

// 🌍 Configure your API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unexpected error occurred. Please try again.";

    if (error.response) {
      const backendMessage = error.response.data?.message;
      if (backendMessage) {
        errorMessage = backendMessage;
      } else if (error.response.status === 401) {
        errorMessage = "You are not authorized. Please log in.";
      } else if (error.response.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      } else if (error.response.status === 404) {
        errorMessage = "The requested resource was not found.";
      } else if (error.response.status >= 500) {
        errorMessage = "A server error occurred. Please try again later.";
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection.";
    }

    // Reject with a custom error object
    return Promise.reject({
      message: errorMessage,
      originalError: error,
    });
  }
);

/* -------------------------------------------------------------------------- */
/* 🧱 TYPE DEFINITIONS                                                        */
/* -------------------------------------------------------------------------- */
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
  correctAnswer: number; // Corrected to number for index
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
  type: "text" | "heading" | "list" | "code" | "diagram";
  content: string;
  ref?: string; // Optional ref for diagram blocks before upload
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

/* -------------------------------------------------------------------------- */
/* 📚 SUBJECT API                                                             */
/* -------------------------------------------------------------------------- */
export const subjectApi = {
  getAll: () => api.get<Subject[]>("/subject"),
  getById: (id: string) => api.get<Subject>(`/subject/${id}`),
  create: (data: Omit<Subject, "_id">) => api.post<Subject>("/subject", data),
  update: (id: string, data: Partial<Subject>) =>
    api.put<Subject>(`/subject/${id}`, data),
  delete: (id: string) => api.delete(`/subject/${id}`),
};

/* -------------------------------------------------------------------------- */
/* 📦 UNIT API                                                                */
/* -------------------------------------------------------------------------- */
export const unitApi = {
  getBySubject: (subjectId: string) =>
    api.get<Unit[]>(`/unit/subject/${subjectId}`),
  getById: (id: string) => api.get<Unit>(`/unit/${id}`),
  create: (data: Omit<Unit, "_id">) => api.post<Unit>("/unit", data),
  update: (id: string, data: Partial<Unit>) =>
    api.put<Unit>(`/unit/${id}`, data),
  delete: (id: string) => api.delete(`/unit/${id}`),
};

/* -------------------------------------------------------------------------- */
/* 🎯 MCQ API                                                                 */
/* -------------------------------------------------------------------------- */
export const mcqApi = {
  baseUrl: "/question/mcq",
  getByUnit: (unitId: string) => api.get<MCQ[]>(`/question/mcq/unit/${unitId}`),
  create: (data: Omit<MCQ, "_id">) => api.post<MCQ>("/question/mcq", data),
  update: (id: string, data: Partial<MCQ>) =>
    api.put<MCQ>(`/question/mcq/${id}`, data),
  delete: (id: string) => api.delete(`/question/mcq/${id}`),
  // Standardized bulk create
  bulkCreate: (data: MCQ[], unitId: string, subjectId: string) =>
    api.post(`/question/mcq/bulk`, {
      unitId,
      subjectId,
      mcqs: data,
    }),
};

/* -------------------------------------------------------------------------- */
/* ✏️ FILL IN THE BLANK API                                                   */
/* -------------------------------------------------------------------------- */
export const fillBlankApi = {
  baseUrl: "/question/fillblank",
  getByUnit: (unitId: string) =>
    api.get<FillBlank[]>(`/question/fillblank/unit/${unitId}`),
  create: (data: Omit<FillBlank, "_id">) =>
    api.post<FillBlank>("/question/fillblank", data),
  update: (id: string, data: Partial<FillBlank>) =>
    api.put<FillBlank>(`/question/fillblank/${id}`, data),
  delete: (id: string) => api.delete(`/question/fillblank/${id}`),
  // Standardized bulk create
  bulkCreate: (data: FillBlank[], unitId: string, subjectId: string) =>
    api.post(`/question/fillblank/bulk`, {
      unitId,
      subjectId,
      fillBlanks: data,
    }),
};

/* -------------------------------------------------------------------------- */
/* 🧠 DESCRIPTIVE API (with bulk + image refs)                                 */
/* -------------------------------------------------------------------------- */
export const descriptiveApi = {
  baseUrl: "/question/descriptive",
  getByUnit: (unitId: string) =>
    api.get<Descriptive[]>(`/question/descriptive/unit/${unitId}`),

  create: (data: Omit<Descriptive, "_id">) =>
    api.post<Descriptive>("/question/descriptive", data),

  update: (id: string, data: Partial<Descriptive>) =>
    api.put<Descriptive>(`/question/descriptive/${id}`, data),

  delete: (id: string) => api.delete(`/question/descriptive/${id}`),

  // Bulk Create Descriptive (already standardized)
  bulkCreate: (
    descriptives: Descriptive[],
    unitId: string,
    subjectId: string,
    refImages: Record<string, string> = {}
  ) =>
    api.post(`/question/descriptive/bulk`, {
      unitId,
      subjectId,
      descriptives,
      refImages,
    }),
};

/* -------------------------------------------------------------------------- */
/* ☁️ FILE UPLOAD API                                                         */
/* -------------------------------------------------------------------------- */
export const uploadApi = {
  // 🔹 Single file upload with progress callback
  upload: (
    file: File,
    folder = 'wasa-learn/uploads',
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return api.post<{ fileUrl: string; publicId?: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },

  // 🔹 Bulk file upload (✅ for /upload/bulk)
  bulkUpload: (
    files: File[],
    folder = 'wasa-learn/bulk_diagrams',
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('folder', folder);
    return api.post<{ images: { ref: string; fileUrl: string }[] }>('/upload/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },

  // 🔐 Get signature for direct Cloudinary upload
  getSignature: (folder = 'wasa-learn/bulk_diagrams') =>
    api.get<{
      signature: string;
      timestamp: number;
      folder: string;
      cloudName: string;
      apiKey: string;
    }>(`/upload/signature?folder=${folder}`),

  // ☁️ Direct upload to Cloudinary (bypasses your server)
  directUploadToCloudinary: async (
    file: File,
    signatureData: {
      signature: string;
      timestamp: number;
      folder: string;
      cloudName: string;
      apiKey: string;
    }
  ): Promise<{ secure_url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', String(signatureData.timestamp));
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }

    return response.json();
  },
};

export default api;