import axios from "axios";
import type { AxiosProgressEvent } from "axios";

// 🌍 Configure your API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject headers based on user role
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('admin_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      // If user is 'private' (Admin), inject the master key
      if (user.role === 'private') {
        config.headers['x-second-space-secret'] = import.meta.env.VITE_SECOND_SPACE_SECRET || 'nullptr_secret_123';
      }
    } catch (e) {
      console.error("Error parsing admin_user", e);
    }
  }
  return config;
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
  visibility?: 'public' | 'private';
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
  type: "text" | "heading" | "subheading" | "list" | "code" | "diagram" | "image" | "callout";
  content?: string;
  items?: string[]; // For list type
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
  getAll: () => api.get<Subject[]>("/subjects"),
  getById: (id: string) => api.get<Subject>(`/subjects/${id}`),
  create: (data: Omit<Subject, "_id">) => api.post<Subject>("/subjects", data),
  update: (id: string, data: Partial<Subject>) =>
    api.put<Subject>(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

/* -------------------------------------------------------------------------- */
/* 📦 UNIT API                                                                */
/* -------------------------------------------------------------------------- */
export const unitApi = {
  getBySubject: (subjectId: string) =>
    api.get<Unit[]>(`/units/subject/${subjectId}`),
  getById: (id: string) => api.get<Unit>(`/units/${id}`),
  create: (data: Omit<Unit, "_id">) => api.post<Unit>("/units", data),
  update: (id: string, data: Partial<Unit>) =>
    api.put<Unit>(`/units/${id}`, data),
  delete: (id: string) => api.delete(`/units/${id}`),
};

/* -------------------------------------------------------------------------- */
/* 🎯 MCQ API                                                                 */
/* -------------------------------------------------------------------------- */
export const mcqApi = {
  getByUnit: (unitId: string): Promise<MCQ[]> =>
    api.get(`/mcq/unit/${unitId}`).then(r => r.data.data ?? []),

  create: (data: Omit<MCQ, "_id">) =>
    api.post<MCQ>("/mcq", data),

  update: (id: string, data: Partial<MCQ>) =>
    api.put<MCQ>(`/mcq/${id}`, data),

  delete: (id: string) =>
    api.delete(`/mcq/${id}`),

  bulkCreate: (data: MCQ[], unitId: string, subjectId: string) =>
    api.post(`/mcq/bulk`, {
      unitId,
      subjectId,
      mcqs: data,
    }),

  bulkDelete: (ids: string[]) =>
    api.delete(`/mcq/bulk`, {
      data: { ids },
    }),
};


/* -------------------------------------------------------------------------- */
/* ✏️ FILL IN THE BLANK API                                                   */
/* -------------------------------------------------------------------------- */
export const fillBlankApi = {
  getByUnit: (unitId: string): Promise<FillBlank[]> =>
    api.get(`/fillblank/unit/${unitId}`).then(r => r.data.data ?? []),

  create: (data: Omit<FillBlank, "_id">) =>
    api.post("/fillblank", data),

  update: (id: string, data: Partial<FillBlank>) =>
    api.put(`/fillblank/${id}`, data),

  delete: (id: string) =>
    api.delete(`/fillblank/${id}`),

  bulkCreate: (data: FillBlank[], unitId: string, subjectId: string) =>
    api.post(`/fillblank/bulk`, {
      unitId,
      subjectId,
      fillBlanks: data,
    }),

  bulkDelete: (ids: string[]) =>
    api.delete(`/fillblank/bulk`, {
      data: { ids },
    }),
};

/* -------------------------------------------------------------------------- */
/* 🧠 DESCRIPTIVE API (with bulk + image refs)                                 */
/* -------------------------------------------------------------------------- */
export const descriptiveApi = {
  getByUnit: (unitId: string): Promise<Descriptive[]> =>
    api.get(`/descriptive/unit/${unitId}`).then(r => r.data.data ?? []),

  create: (data: Omit<Descriptive, "_id">) =>
    api.post("/descriptive", data),

  update: (id: string, data: Partial<Descriptive>) =>
    api.put(`/descriptive/${id}`, data),

  delete: (id: string) =>
    api.delete(`/descriptive/${id}`),

  bulkCreate: (descriptives, unitId, subjectId, refImages = {}) =>
    api.post(`/descriptive/bulk`, {
      unitId,
      subjectId,
      descriptives,
      refImages,
    }),

  bulkDelete: (ids: string[]) =>
    api.delete(`/descriptive/bulk`, {
      data: { ids },
    }),
};

/* -------------------------------------------------------------------------- */
/* ☁️ FILE UPLOAD API                                                         */
/* -------------------------------------------------------------------------- */
export const uploadApi = {
  upload: (
    file: File,
    folder = "wasa-learn/uploads",
    onUploadProgress?: (e: AxiosProgressEvent) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return api.post<{ fileUrl: string; publicId?: string }>(
      "/upload",
      formData,
      {
        timeout: 60_000,
        onUploadProgress,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  bulkUpload: (
    files: File[],
    folder = "wasa-learn/bulk_diagrams",
    onUploadProgress?: (e: AxiosProgressEvent) => void
  ) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("folder", folder);

    return api.post<{ images: { ref: string; fileUrl: string }[] }>(
      "/upload/bulk",
      formData,
      {
        timeout: 120_000,
        onUploadProgress,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  getSignature: (folder = "wasa-learn/bulk_diagrams") =>
    api.get<{
      signature: string;
      timestamp: number;
      folder: string;
      cloudName: string;
      apiKey: string;
    }>(`/upload/signature?folder=${folder}`),

  directUploadToCloudinary: async (
    file: File,
    signatureData: {
      signature: string;
      timestamp: number;
      folder: string;
      cloudName: string;
      apiKey: string;
    }
  ): Promise<{
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);
    const uploadUrl = `${import.meta.env.VITE_CLOUDINARY_UPLOAD_URL}/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;



    const res = await fetch(
      `${uploadUrl}`, { method: "POST", body: formData }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Cloudinary upload failed");
    }

    return res.json();
  },
};

export default api;