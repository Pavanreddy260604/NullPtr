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
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Access to storage is not allowed')) {
      console.warn("🛡️ Suppressed storage access error:", event.reason.message);
      event.preventDefault();
    }
  });
}

// ✅ Check if storage (IndexedDB & LocalStorage) is actually allowed
const checkStorageAccess = () => {
  const status = {
    local: false,
    idb: false
  };

  try {
    // Check if LocalStorage is REAL (not polyfilled/restricted)
    // We check if it's the native implementation that throws or a memory fallback
    const testKey = "__real_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    status.local = true;

    // Detect if our polyfill is active (we added a marker in polyfill if it fails)
    if ((window.localStorage as any).__is_fallback) {
      status.local = false;
    }
  } catch (e) {
    status.local = false;
  }

  try {
    // Thorough check for IndexedDB
    // Some browsers have it defined but throw "Access to storage is not allowed" on any access
    if (typeof indexedDB !== 'undefined') {
      const request = indexedDB.open("__storage_test__");
      status.idb = true;
      // We don't need to wait for success, just that it didn't throw immediately
    }
  } catch (e) {
    console.warn("🛡️ IndexedDB restricted");
    status.idb = false;
  }

  return status;
};

const storage = checkStorageAccess();
const storageAllowed = storage.local && storage.idb;

console.log("💾 [Storage] Status:", storage);

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
