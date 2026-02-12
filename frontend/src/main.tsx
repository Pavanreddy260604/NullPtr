import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

/**
 * 🛡️ Global Storage Polyfill
 * This prevents third-party libraries (like next-themes) from crashing the app
 * when localStorage/sessionStorage are restricted (Incognito, etc).
 */
(function hardenStorage() {
    const createSafeStorage = (type: 'localStorage' | 'sessionStorage') => {
        try {
            const testKey = "__storage_test__";
            window[type].setItem(testKey, testKey);
            window[type].removeItem(testKey);
            return window[type];
        } catch (e) {
            console.warn(`⚠️ [Harden] ${type} restricted. Using memory fallback.`);
            const storageStore: Record<string, string> = {};
            return {
                getItem: (key: string) => storageStore[key] || null,
                setItem: (key: string, value: string) => { storageStore[key] = String(value); },
                removeItem: (key: string) => { delete storageStore[key]; },
                clear: () => { for (let k in storageStore) delete storageStore[k]; },
                key: (i: number) => Object.keys(storageStore)[i] || null,
                get length() { return Object.keys(storageStore).length; }
            } as Storage;
        }
    };

    try {
        if (!window.localStorage) (window as any).localStorage = createSafeStorage('localStorage');
        if (!window.sessionStorage) (window as any).sessionStorage = createSafeStorage('sessionStorage');
    } catch (e) {
        // Handle cases where even defining them fails (rare)
        console.error("Critical: Failed to polyfill storage", e);
    }
})();

// ✅ Safe Service Worker Registration
// Service Workers often fail with "Access to storage is not allowed" 
// in restricted contexts (Incognito, third-party cookies blocked).
const registerSafeSW = () => {
    try {
        // Simple heuristic: if localStorage is blocked, SW storage likely is too
        localStorage.getItem('test');

        return registerSW({
            onNeedRefresh() {
                if (confirm('New content available. Reload?')) {
                    window.location.reload();
                }
            },
            onOfflineReady() {
                console.log('App is ready to work offline');
            },
        });
    } catch (e) {
        console.warn("🛡️ Storage access restricted. Service Worker disabled.", e);
        return () => { }; // Return no-op unregister function
    }
};

const updateSW = registerSafeSW();

createRoot(document.getElementById("root")!).render(<App />);
