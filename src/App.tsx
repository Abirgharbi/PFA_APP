import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";

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
import { useIsMobile } from "./hooks/use-mobile";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import SharedReportView from "./pages/SharedReportView";
import SharedReportPage from "./pages/SharedReportPage";
import PatientPage from "./pages/PatientPage";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();
  const [isAppReady, setIsAppReady] = useState(false);

  // Give mobile devices a moment to initialize properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Show nothing while the app is initializing on mobile
  if (!isAppReady && isMobile) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={isMobile ? <Login /> : <Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-code" element={<VerifyCode />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<ScanReport />} />
              <Route path="/report/:id" element={<ReportDetails />} />
              <Route path="/archive" element={<ReportArchive />} />
              <Route path="/share/:id" element={<ShareReport />} />
              <Route path="/graph" element={<ReportsAnalytics />} />
              <Route path="/patients/:id/reports" element={<PatientReports />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/shared/:id" element={<SharedReportView />} />
              <Route path="/listPatients" element={<PatientPage/>} />
              
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
  