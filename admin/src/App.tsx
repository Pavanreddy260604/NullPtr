import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/contexts/AuthContext";

import Login from "./pages/admin/Login";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Subjects from "./pages/admin/Subjects";
import Units from "./pages/admin/Units";
import QuestionsList from "./pages/admin/QuestionsList";
import Questions from "./pages/admin/Questions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Public Route */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Layout */}
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Subjects */}
              <Route path="/subjects" element={<Subjects />} />

              {/* Units - unified (standalone + nested) */}
              <Route path="/units" element={<Units />} />
              <Route path="/subjects/:subjectId/units" element={<Units />} />

              {/* Questions */}
              <Route path="/questions" element={<Questions />} />
              <Route path="/questions/:unitId" element={<Questions />} />
            </Route>

            {/* Fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
