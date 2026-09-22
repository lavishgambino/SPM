import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import LayoutVarsProvider from "@/components/layout/LayoutVarsProvider";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Projects from "./pages/Projects";

import Conversation from "./pages/Conversation";
import NotFound from "./pages/NotFound";
import EPMODashboard from "./pages/arc/EPMODashboard";
import BudgetReport from "./pages/arc/BudgetReport";
import BudgetDeepDive from "./pages/arc/BudgetDeepDive";
import CapacityReport from "./pages/arc/CapacityReport";
import ExecutionHealthReport from "./pages/arc/ExecutionHealthReport";
import GovernanceReport from "./pages/arc/GovernanceReport";
import Portfolios from "./pages/arc/Portfolios";
import ActivePlans from "./pages/arc/ActivePlans";

const queryClient = new QueryClient();

/**
 * On a full page load from the root, send the user to the canonical "Setting up
 * first plan" chat so the demo always starts at zero. Direct loads of other
 * valid routes (e.g. /projects/2/chat/14 after New Chat) are left alone.
 */
const BOOT_HOME = "/projects/2/chat/11";
function BootRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const didRunRef = useRef(false);
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    // Only redirect from generic entry points, not from any valid in-app route.
    const p = location.pathname;
    if (p === "/" || p === "" || p === "/index.html" || p === "/home" || p === "/welcome" || p === "/projects") {
      navigate(BOOT_HOME, { replace: true });
    }
  }, [location.pathname, navigate]);
  return null;
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LayoutVarsProvider />
        <BootRedirect />
        <Routes>
          <Route path="/" element={<Navigate to="/projects/2/chat/11" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/welcome" element={<Index />} />
          <Route path="/projects" element={<Projects />} />
          
          <Route path="/projects/:projectId/chat/:chatId" element={<Conversation />} />
          <Route path="/reporting/epmo" element={<EPMODashboard />} />
          <Route path="/reporting/budget" element={<BudgetReport />} />
          <Route path="/reporting/budget-deep-dive" element={<BudgetDeepDive />} />
          <Route path="/reporting/capacity" element={<CapacityReport />} />
          <Route path="/reporting/execution-health" element={<ExecutionHealthReport />} />
          <Route path="/governance" element={<GovernanceReport />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/active-plans" element={<ActivePlans />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
