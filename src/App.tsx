import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import FleetPage from "./pages/FleetPage";
import SatisfactionPage from "./pages/SatisfactionPage";
import { ThemeProvider } from "@/hooks/useTheme";
import UserManagementPage from "./pages/UserManagementPage";
import CoordinationPage from "./pages/CoordinationPage";
import DriverMessagingPage from "./pages/DriverMessagingPage";
import SatisfactionSurveyPage from "./pages/SatisfactionSurveyPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicy from './pages/PrivacyPolicy';
import DashboardConfiguracoes from './pages/DashboardConfiguracoes';
import RequireAuth from '@/components/auth/RequireAuth';
import SecretariaPage from './pages/SecretariaPage';
import TabsMensagens from "./components/mensagens/TabsMensagens";
import PainelMensagens from "./pages/PainelMensagens";


const App = () => {
  // Create a client
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/PesquisaSatisfacao" element={<SatisfactionSurveyPage />} />
              <Route path="/FaleConosco" element={<ContactPage />} />
              <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="frota" element={<FleetPage />} />
                <Route path="satisfacao" element={<SatisfactionPage />} />
                <Route path="mensagens" element={< PainelMensagens/>} />
                <Route path="usuarios" element={<UserManagementPage />} />
                <Route path="coordenacao" element={<CoordinationPage />} />
                <Route path="motorista-elogios" element={<DriverMessagingPage />} />
                <Route path="configuracoes" element={<DashboardConfiguracoes />} />
              </Route>

              <Route path="/secretaria" element={<SecretariaPage />} />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
