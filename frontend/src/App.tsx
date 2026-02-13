import { useState, useEffect } from "react";
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
import DevTest from "./pages/DevTest";
import NotFound from "./pages/NotFound";
import { InstallPWA } from "@/components/InstallPWA";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// ✅ 1. Absolute Top: Global Error Suppression
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

// ✅ 2. Async Handshake Probe
const probeStorage = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (typeof window.indexedDB === 'undefined' || window.indexedDB === null) {
        return resolve(false);
      }

      // Proactive Handshake: Actually try to open a connection
      const request = window.indexedDB.open("__nullptr_probe__", 1);

      const timeout = setTimeout(() => {
        // Optimistic: if probe times out, assume storage works
        // rather than disabling persistence on slow devices
        resolve(true);
      }, 1000);

      request.onsuccess = () => {
        clearTimeout(timeout);
        try {
          const test = "__h_test__";
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          resolve(!(localStorage as any).__is_fallback);
        } catch (e) {
          resolve(false);
        }
      };

      request.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    } catch (e) {
      resolve(false);
    }
  });
};

// Global flags (updated after probe)
let storageAllowedGlobal = false;

// Safe storage for next-themes
const safeThemeStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) { }
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key); } catch (e) { }
  }
};

const persister = {
  persistClient: async (client: any) => {
    if (!storageAllowedGlobal) return;
    try { await set('react-query-cache', client); } catch (err) { }
  },
  restoreClient: async () => {
    if (!storageAllowedGlobal) return undefined;
    try { return await get('react-query-cache'); } catch (err) { return undefined; }
  },
  removeClient: async () => {
    if (!storageAllowedGlobal) return;
    try { await del('react-query-cache'); } catch (err) { }
  },
} as any;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 30,       // 30 days – keep cached data for offline
      staleTime: 1000 * 60 * 60 * 24,          // 1 day  – avoid refetch spam
      networkMode: 'offlineFirst',              // Serve cache instantly, revalidate if online
      retry: (failureCount, error) => {
        // Don't retry when offline – serve stale cache instead
        if (!navigator.onLine) return false;
        return failureCount < 2;
      },
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
        <Route path="/dev/test-pdf" element={<DevTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

const App = () => {
  const [storageReady, setStorageReady] = useState(false);
  const [storageAllowed, setStorageAllowed] = useState(false);

  useEffect(() => {
    probeStorage().then(allowed => {
      storageAllowedGlobal = allowed;
      setStorageAllowed(allowed);
      setStorageReady(true);
      console.log(`🛡️ [Resilience] Handshake Complete. Storage Allowed: ${allowed}`);
    });
  }, []);

  if (!storageReady) return null;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="theme"
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
};

export default App;
