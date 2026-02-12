import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { get, set, del } from 'idb-keyval';
import Index from "./pages/Index";
import SubjectPage from "./pages/SubjectPage";
import UnitPage from "./pages/UnitPage";
import NotFound from "./pages/NotFound";
import { InstallPWA } from "@/components/InstallPWA";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// ✅ Global Error Suppression for restricted storage contexts
// Detects and mutes the frequent "Access to storage is not allowed" crash in Chrome/Safari
if (typeof window !== 'undefined') {
  const muteStorageError = (e: any) => {
    const msg = e?.message || (typeof e === 'string' ? e : '');
    if (msg.includes('Access to storage is not allowed') || msg.includes('SecurityError')) {
      // console.warn("🛡️ Muted storage access error:", msg);
      return true;
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (muteStorageError(event.reason)) event.preventDefault();
  });
  window.addEventListener('error', (event) => {
    if (muteStorageError(event.error)) event.stopImmediatePropagation();
  }, true);
}

// ✅ Check if storage (IndexedDB & LocalStorage) is actually allowed
const checkStorageAccess = () => {
  const status = { local: false, idb: false };

  try {
    // 1. Check LocalStorage (Real vs Polyfill)
    const testKey = "__real_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    status.local = !(window.localStorage as any).__is_fallback;
  } catch (e) {
    status.local = false;
  }

  try {
    // 2. Check IndexedDB Usability
    // In many browsers, just calling .open() doesn't throw, but accessing indexedDB property might.
    if (typeof window.indexedDB !== 'undefined' && window.indexedDB !== null) {
      // Proactive probe: Try to open a dummy DB. 
      // In some restricted contexts, this throws a SecurityError immediately.
      const request = window.indexedDB.open("__storage_test_probe__");
      if (request) status.idb = true;
    }
  } catch (e) {
    status.idb = false;
  }

  return status;
};

const storage = checkStorageAccess();
const storageAllowed = storage.local && storage.idb;

console.log(`💾 [Storage] Local: ${storage.local}, IDB: ${storage.idb} -> Allowed: ${storageAllowed}`);

// Safe storage for next-themes to prevent crashes
const safeThemeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) { }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) { }
  },
};

// Create cache persister using IDB-Keyval (IndexedDB)
const persister = {
  persistClient: async (client: any) => {
    if (!storageAllowed) return;
    try {
      await set('react-query-cache', client);
    } catch (err) {
      console.warn("Storage access denied. Cache persistence disabled.", err);
    }
  },
  restoreClient: async () => {
    if (!storageAllowed) return undefined;
    try {
      return await get('react-query-cache');
    } catch (err) {
      console.warn("Storage access denied. Cache persistence disabled.", err);
      return undefined;
    }
  },
  removeClient: async () => {
    if (!storageAllowed) return;
    try {
      await del('react-query-cache');
    } catch (err) {
      console.warn("Storage access denied. Cache persistence disabled.", err);
    }
  },
} as any;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days (Long-term offline support)
      staleTime: 1000 * 60 * 60 * 2,   // 2 hours
      retry: storageAllowed ? 3 : 1,   // Less retries if offline/restricted
    },
  },
});

const AppContent = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <InstallPWA />
    <OfflineIndicator />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/subjects/:subjectId" element={<SubjectPage />} />
        <Route path="/units/:unitId" element={<UnitPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem={storageAllowed}
    storageKey={storageAllowed ? "theme" : undefined}
  >
    {storageAllowed ? (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 30 }}
      >
        <AppContent />
      </PersistQueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    )}
  </ThemeProvider>
);

export default App;
