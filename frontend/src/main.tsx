import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import App from "./App.tsx";
import "./index.css";

// ✅ Safe Service Worker Registration
const registerSafeSW = () => {
    try {
        // Detect if storage is restricted BEFORE trying SW
        if (typeof window.indexedDB === 'undefined' || window.indexedDB === null) {
            return () => { };
        }

        // Active probe
        window.indexedDB.open("__sw_test_probe__");

        return registerSW({
            onNeedRefresh() {
                if (confirm('New content available. Reload?')) {
                    window.location.reload();
                }
            },
            onOfflineReady() {
                // Silently ready
            },
        });
    } catch (e) {
        return () => { };
    }
};

const updateSW = registerSafeSW();

createRoot(document.getElementById("root")!).render(<App />);
