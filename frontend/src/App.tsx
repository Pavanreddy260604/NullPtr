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

// ✅ 1. Absolute Top: Global Error Suppression
// Prevents libraries (like Service Workers or Query Persistence) from crashing the app
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

// ✅ 2. Active Handshake Storage Check
const checkStorageAccess = () => {
  const status = { local: false, idb: false };

  try {
    // LocalStorage Check: Must be REAL and WRITABLE
    if (typeof window.localStorage !== 'undefined' && !(window.localStorage as any).__is_fallback) {
      const testKey = "__handshake_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      status.local = true;
    }
  } catch (e) {
    status.local = false;
  }

  try {
    // IndexedDB Check: Must allow OPENING a connection
    // Passive check (typeof) is not enough; restricted browsers throw on .open()
    if (typeof window.indexedDB !== 'undefined' && window.indexedDB !== null) {
      const probe = window.indexedDB.open("__handshake_probe__");
      if (probe) status.idb = true;
    }
  } catch (e) {
    status.idb = false;
  }

  return status;
};

const storage = checkStorageAccess();
const storageAllowed = storage.local && storage.idb;

if (typeof window !== 'undefined') {
  console.log(`🛡️ [Resilience] Storage Allowed: ${storageAllowed} (Local: ${storage.local}, IDB: ${storage.idb})`);
}

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
