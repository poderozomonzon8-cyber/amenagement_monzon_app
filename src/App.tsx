/**
 * ROUTER LOCK — Aménagement Monzon Ecosystem
 * No modificar estructura de rutas sin indicación explícita.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

/* Splash */
import SplashScreen from "@/components/SplashScreen";
import { useSplash } from "@/contexts/SplashContext";

/* Public Pages */
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import CompanyPage from "@/pages/CompanyPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import StorePage from "@/pages/StorePage";
import CommunityPage from "@/pages/CommunityPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import AcademyPage from "@/pages/AcademyPage";
import MaintenancePage from "@/pages/MaintenancePage";
import AIChatPage from "@/pages/AIChatPage";

/* Auth */
import LoginPage from "@/pages/LoginPage";

/* Protected — Client Portal */
import ClientPortalPage from "@/pages/ClientPortalPage";

/* Protected — Admin Panel */
import AdminPage from "@/pages/AdminPage";

/* Internal router component */
function AppRoutes() {
  const { shouldShowSplash } = useSplash();

  return (
    <>
      {shouldShowSplash && <SplashScreen />}

      <Routes>
        {/* Public Website */}
        <Route path="/"                 element={<HomePage />} />
        <Route path="/about"            element={<AboutPage />} />
        <Route path="/about/company"    element={<CompanyPage />} />
        <Route path="/services"         element={<ServicesPage />} />
        <Route path="/portfolio"        element={<PortfolioPage />} />
        <Route path="/store"            element={<StorePage />} />
        <Route path="/community"        element={<CommunityPage />} />
        <Route path="/contact"          element={<ContactPage />} />
        <Route path="/blog"             element={<BlogPage />} />
        <Route path="/academy"          element={<AcademyPage />} />
        <Route path="/maintenance"      element={<MaintenancePage />} />
        <Route path="/ai-chat"          element={<AIChatPage />} />

        {/* Auth */}
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<LoginPage mode="register" />} />
        <Route path="/admin/login"      element={<LoginPage mode="admin" />} />

        {/* Client Portal */}
        <Route path="/portal"           element={<ClientPortalPage />} />
        <Route path="/portal/:section"  element={<ClientPortalPage />} />

        {/* Admin Panel */}
        <Route path="/admin"            element={<AdminPage />} />
        <Route path="/admin/:panel"     element={<AdminPage />} />
      </Routes>
    </>
  );
}

/* Root App */
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}