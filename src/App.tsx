import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LocationProvider } from "./contexts/LocationContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Logistics from "./pages/Logistics";
import Settings from "./pages/Settings";
import CalendarPage from "./pages/Calendar";
import SmartShelfPage from "./pages/SmartShelfPage";
import UploadDataPage from "./pages/UploadData";
import NotFound from "./pages/NotFound";

const CLERK_PUBLISHABLE_KEY = "pk_test_dG9waWNhbC1raXR0ZW4tNC5jbGVyay5hY2NvdW50cy5kZXYk";

const queryClient = new QueryClient();

// Initialize dark mode from localStorage
const initDarkMode = () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
};
initDarkMode();

const AuthRedirect = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Auth />;
};

const App = () => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AuthRedirect />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload-data"
                  element={
                    <ProtectedRoute>
                      <UploadDataPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/logistics"
                  element={
                    <ProtectedRoute>
                      <Logistics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/smart-shelf"
                  element={
                    <ProtectedRoute>
                      <SmartShelfPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </LocationProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
