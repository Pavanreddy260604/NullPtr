
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
};
