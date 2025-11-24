import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Unit3 from "./pages/wsma/Unit3";
import Unit4 from "./pages/wsma/Unit4";
import Unit5 from "./pages/wsma/Unit5";
import NotFound from "./pages/NotFound";
import Wsma from "./pages/wsma/Wsma";

import Cloud1 from "./pages/cloud/Cloud1";
import Unit3c from "./pages/cloud/Unit-3";
import Unit4c from "./pages/cloud/Unit4";
import Unit5c from "./pages/cloud/Unit5";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wsma" element={<Wsma />} />
          <Route path="/wsma/unit-3" element={<Unit3 />} />
          <Route path="/wsma/unit-4" element={<Unit4 />} />
          <Route path="/wsma/unit-5" element={<Unit5 />} />
          <Route path="/cloud" element={<Cloud1 />} />
          <Route path="/cloud/unit-3" element={<Unit3c />} />
          <Route path="/cloud/unit-4" element={<Unit4c />} />
          <Route path="/cloud/unit-5" element={<Unit5c />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
