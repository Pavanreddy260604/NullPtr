import { createRoot } from "react-dom/client";
import App from "./App";
import { initSecurityProtections } from "./lib/security";
import "./index.css";

/**
 * 🛡️ Global Storage Proactive Handshake
 */

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

// Initialize security protections
initSecurityProtections();

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = createRoot(rootElement);
    probeStorage().then(() => {
        root.render(<App />);
    });
}
