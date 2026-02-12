import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

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
