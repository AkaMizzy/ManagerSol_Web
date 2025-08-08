import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import CreateCompany from "./pages/CreateCompany";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";
import TaskElements from "./pages/TaskElements";
import TaskGroupModels from "./pages/TaskGroupModels";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const CompanyDetailWrapper = () => {
  const { id } = useParams();
  return <CompanyDetail companyId={id!} onClose={() => window.history.back()} />;
};

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = raw ? JSON.parse(raw) : null;
  const token = auth?.token;
  const role = auth?.role;

  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LandingRoute() {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = raw ? JSON.parse(raw) : null;
  const token = auth?.token;
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

function ProtectedApp() {
  // Synchronously gate the entire app shell to avoid any flash of protected UI
  const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = raw ? JSON.parse(raw) : null;
  const token = auth?.token;
  if (!token) return <Navigate to="/" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><Companies /></ProtectedRoute>} />
        <Route path="/companies/:id" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><CompanyDetailWrapper /></ProtectedRoute>} />
        <Route path="/create-company" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><CreateCompany /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><Teams /></ProtectedRoute>} />
        <Route path="/task-elements" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><TaskElements /></ProtectedRoute>} />
        <Route path="/task-group-models" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><TaskGroupModels /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
