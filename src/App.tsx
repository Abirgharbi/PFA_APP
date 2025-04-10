
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScanReport from "./pages/ScanReport";
import ReportDetails from "./pages/ReportDetails";
import ReportArchive from "./pages/ReportArchive";
import ShareReport from "./pages/ShareReport";
import PatientReports from "./pages/PatientReports";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import VerifyCode from "./pages/VerifyCode";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanReport />} />
            <Route path="/report/:id" element={<ReportDetails />} />
            <Route path="/archive" element={<ReportArchive />} />
            <Route path="/share/:id" element={<ShareReport />} />
            <Route path="/patients/:id/reports" element={<PatientReports />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
