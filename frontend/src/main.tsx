import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

// ✅ Safe Service Worker Registration
// Note: We always register the SW even without IndexedDB because the
// Workbox HTTP cache (CacheStorage API) works independently of IDB.
// This ensures static assets and API responses are cached for offline use.
const registerSafeSW = () => {
    try {
        if (!('serviceWorker' in navigator)) {
            console.warn('[SW] Service workers not supported in this browser');
            return () => { };
        }

        return registerSW({
            onNeedRefresh() {
                if (confirm('New content available. Reload?')) {
                    window.location.reload();
                }
            },
            onOfflineReady() {
                console.log('📦 [SW] App is ready for offline use');
            },
        });
    } catch (e) {
        console.warn('[SW] Registration failed:', e);
        return () => { };
    }
};

const updateSW = registerSafeSW();

createRoot(document.getElementById("root")!).render(<App />);
