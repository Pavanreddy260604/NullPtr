// API Configuration - Uses environment variable for deployment flexibility
// API Configuration - Uses environment variable for deployment flexibility
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

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
    correctAnswer: number;
    explanation?: string;
    topic?: string;
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
    topic?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AnswerBlock {
    type: "text" | "heading" | "subheading" | "list" | "code" | "diagram" | "image" | "callout";
    content?: string;
    items?: string[];
    ref?: string;
}

export interface Descriptive {
    _id: string;
    subjectId: string;
    unitId: string;
    question: string;
    answer: AnswerBlock[];
    topic?: string;
    createdAt?: string;
    updatedAt?: string;
}

/* -------------------------------------------------------------------------- */
/* 🔧 HELPER                                                                  */
/* -------------------------------------------------------------------------- */
async function fetchApi<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem("second_space_secret");
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["x-second-space-secret"] = token;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }
    const json = await response.json();
    return json.data ?? json;
}

/* -------------------------------------------------------------------------- */
/* 📚 SUBJECT API                                                             */
/* -------------------------------------------------------------------------- */
export async function getSubjects(): Promise<Subject[]> {
    return fetchApi<Subject[]>("/subjects");
}

export async function getSubject(id: string): Promise<Subject> {
    return fetchApi<Subject>(`/subjects/${id}`);
}

/* -------------------------------------------------------------------------- */
/* 📦 UNIT API                                                                */
/* -------------------------------------------------------------------------- */
export async function getUnitsBySubject(subjectId: string): Promise<Unit[]> {
    return fetchApi<Unit[]>(`/units/subject/${subjectId}`);
}

export async function getUnit(id: string): Promise<Unit> {
    return fetchApi<Unit>(`/units/${id}`);
}

/* -------------------------------------------------------------------------- */
/* 🎯 MCQ API                                                                 */
/* -------------------------------------------------------------------------- */
export async function getMCQsByUnit(unitId: string): Promise<MCQ[]> {
    return fetchApi<MCQ[]>(`/mcq/unit/${unitId}`);
}

/* -------------------------------------------------------------------------- */
/* ✏️ FILL BLANK API                                                          */
/* -------------------------------------------------------------------------- */
export async function getFillBlanksByUnit(unitId: string): Promise<FillBlank[]> {
    return fetchApi<FillBlank[]>(`/fillblank/unit/${unitId}`);
}

/* -------------------------------------------------------------------------- */
/* 🧠 DESCRIPTIVE API                                                          */
/* -------------------------------------------------------------------------- */
export async function getDescriptivesByUnit(unitId: string): Promise<Descriptive[]> {
    return fetchApi<Descriptive[]>(`/descriptive/unit/${unitId}`);
}
