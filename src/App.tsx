import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import StudentLayout from "@/components/StudentLayout";
import AdminLayout from "@/components/AdminLayout";
import AnimatedPage from "@/components/AnimatedPage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import RegisterExam from "./pages/RegisterExam";
import MyRegistrations from "./pages/MyRegistrations";
import Profile from "./pages/Profile";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExams from "./pages/admin/AdminExams";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminReports from "./pages/admin/AdminReports";
import NotFound from "./pages/NotFound";
import AIChatbot from "@/components/AIChatbot";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

const StudentPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <StudentLayout>{children}</StudentLayout>
  </ProtectedRoute>
);

const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <AnimatedPage>{children}</AnimatedPage>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<P><Index /></P>} />
        <Route path="/login" element={<P><Login /></P>} />
        <Route path="/register" element={<P><Register /></P>} />
        <Route path="/forgot-password" element={<P><ForgotPassword /></P>} />
        <Route path="/reset-password" element={<P><ResetPassword /></P>} />
        <Route path="/verify-email" element={<P><EmailVerification /></P>} />
        <Route path="/dashboard" element={<StudentPage><P><Dashboard /></P></StudentPage>} />
        <Route path="/exams" element={<StudentPage><P><Exams /></P></StudentPage>} />
        <Route path="/register-exam/:examId" element={<StudentPage><P><RegisterExam /></P></StudentPage>} />
        <Route path="/my-registrations" element={<StudentPage><P><MyRegistrations /></P></StudentPage>} />
        <Route path="/profile" element={<StudentPage><P><Profile /></P></StudentPage>} />
        <Route path="/payment-success" element={<StudentPage><P><PaymentSuccess /></P></StudentPage>} />
        <Route path="/admin" element={<AdminPage><P><AdminDashboard /></P></AdminPage>} />
        <Route path="/admin/exams" element={<AdminPage><P><AdminExams /></P></AdminPage>} />
        <Route path="/admin/registrations" element={<AdminPage><P><AdminRegistrations /></P></AdminPage>} />
        <Route path="/admin/reports" element={<AdminPage><P><AdminReports /></P></AdminPage>} />
        <Route path="*" element={<P><NotFound /></P>} />
      </Routes>
    </AnimatePresence>
  );
}

function MainLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <>
      <AnimatedRoutes />
      
      {/* Global AI Floating Toggle */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-2xl flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform z-50 animate-fade-in group"
      >
        <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      <AIChatbot open={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
