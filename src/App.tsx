import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import DealerDetail from "./pages/DealerDetail";
import Dealers from "./pages/Dealers";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Comparison from "./pages/Comparison";
import Trends from "./pages/Trends";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import Auth from "./pages/Auth";
import PreOnboarding from "./pages/PreOnboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, demoMode } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user && !demoMode) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading, demoMode } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (user || demoMode) return <Navigate to="/" replace />;
  return <Auth />;
}

function DealersRedirect() {
  const { name } = useParams();
  return <Navigate to={`/dealer/${name || ""}`} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthRoute />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/dealers" element={<ProtectedRoute><Dealers /></ProtectedRoute>} />
    <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
    <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
    <Route path="/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
    <Route path="/pre-onboarding" element={<ProtectedRoute><PreOnboarding /></ProtectedRoute>} />
    <Route path="/dealer/:name" element={<ProtectedRoute><DealerDetail /></ProtectedRoute>} />
    <Route path="/dealers/:name" element={<DealersRedirect />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
