import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Companies from "./pages/SuperAdmin/company/Companies";
import CompanyDetail from "./pages/SuperAdmin/company/CompanyDetail";
import CreateCompany from "./pages/SuperAdmin/company/CreateCompany";
import User from "./pages/Admin/users/Users";
import NotFound from "./pages/NotFound";
import TaskElements from "./pages/Admin/task_management/TaskElements";
import TaskGroupModels from "./pages/Admin/task_management/TaskGroupModels";
import TaskGroupElementBoard from "./pages/Admin/task_management/TaskGroupElementBoard";
import ProjectManagement from "./pages/Admin/project_management/ProjectManagement";
import Login from "./pages/Login";
import UserProfile from "./pages/Profile/UserProfile";

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
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
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
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}>{
          (() => {
            const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
            const auth = raw ? JSON.parse(raw) : null;
            const role = auth?.role;
            if (role === 'superAdmin') return <SuperAdminDashboard />;
            if (role === 'admin') return <AdminDashboard />;
          })()
        }</ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute allowedRoles={["superAdmin"]}><Companies /></ProtectedRoute>} />
        <Route path="/companies/:id" element={<ProtectedRoute allowedRoles={["superAdmin"]}><CompanyDetailWrapper /></ProtectedRoute>} />
        <Route path="/create-company" element={<ProtectedRoute allowedRoles={["superAdmin"]}><CreateCompany /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={["superAdmin","admin"]}><User /></ProtectedRoute>} />
        <Route path="/project-management" element={<ProtectedRoute allowedRoles={["admin"]}><ProjectManagement /></ProtectedRoute>} />
        <Route path="/task-elements" element={<ProtectedRoute allowedRoles={["admin"]}><TaskElements /></ProtectedRoute>} />
        <Route path="/task-group-models" element={<ProtectedRoute allowedRoles={["admin"]}><TaskGroupModels /></ProtectedRoute>} />
        <Route path="/task-group-elements" element={<ProtectedRoute allowedRoles={["admin"]}><TaskGroupElementBoard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["superAdmin","admin","user"]}><UserProfile /></ProtectedRoute>} />
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
