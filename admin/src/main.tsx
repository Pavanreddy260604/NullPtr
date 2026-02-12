/**
 * 🛡️ Global Storage Polyfill
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
        console.error("Critical: Failed to polyfill storage", e);
    }
})();

// Initialize security protections (blocks APK downloads, malicious URLs, etc.)
initSecurityProtections();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

createRoot(document.getElementById("root")!).render(<App />);
