import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetailWrapper />} />
                <Route path="/create-company" element={<CreateCompany />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/task-elements" element={<TaskElements />} />
                <Route path="/task-group-models" element={<TaskGroupModels />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
