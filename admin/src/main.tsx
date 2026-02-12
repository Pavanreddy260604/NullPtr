import { createRoot } from "react-dom/client";
import App from "./App";
import { initSecurityProtections } from "./lib/security";

/**
 * 🛡️ Top-Level Nuclear Error Suppression
 */
if (typeof window !== 'undefined') {
    const isStorageError = (e: any) => {
        const msg = (e?.message || (typeof e === 'string' ? e : '')).toLowerCase();
        return msg.includes('access to storage is not allowed') ||
            msg.includes('securityerror') ||
            msg.includes('idbdatabase');
    };

    window.addEventListener('unhandledrejection', (event) => {
        if (isStorageError(event.reason)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    window.addEventListener('error', (event) => {
        if (isStorageError(event.error) || isStorageError(event.message)) {
            event.stopImmediatePropagation();
        }
    }, true);
}

/**
 * 🛡️ Global Storage Polyfill & Proactive Handshake
 */
const probeStorage = (): Promise<boolean> => {
    return new Promise((resolve) => {
        try {
            if (typeof window.indexedDB === 'undefined' || window.indexedDB === null) {
                return resolve(false);
            }
            const request = window.indexedDB.open("__admin_nullptr_probe__", 1);
            const timeout = setTimeout(() => resolve(false), 500);

            request.onsuccess = () => {
                clearTimeout(timeout);
                try {
                    const test = "__h_test__";
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    resolve(true);
                } catch (e) { resolve(false); }
            };
            request.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
        } catch (e) { resolve(false); }
    });
};

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
        console.error("Critical: Failed to polyfill storage", e);
    }
})();

// Initialize security protections
initSecurityProtections();

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = createRoot(rootElement);
    probeStorage().then(() => {
        root.render(<App />);
    });
}
