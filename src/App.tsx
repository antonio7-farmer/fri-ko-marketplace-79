import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { pushNotificationService } from "@/services/pushNotifications";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterBuyer from "./pages/RegisterBuyer";
import RegisterSeller from "./pages/RegisterSeller";
import SetupLocation from "./pages/setup/SetupLocation";
import SetupProfile from "./pages/setup/SetupProfile";
import Home from "./pages/Home";
import OPGsList from "./pages/OPGsList";
import OPGProfile from "./pages/OPGProfile";
import ProductDetails from "./pages/ProductDetails";
import MapView from "./pages/MapView";
import Conversations from "./pages/Conversations";
import ChatThread from "./pages/ChatThread";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import Notifications from "./pages/Notifications";
import Reservations from "./pages/Reservations";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Help from "./pages/Help";
import NotificationSettings from "./pages/NotificationSettings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle Android back button
  useAndroidBackButton();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Initialize push notifications when user logs in
        if (event === 'SIGNED_IN' && session?.user) {
          await pushNotificationService.initialize();
        }

        // Remove FCM token when user logs out
        if (event === 'SIGNED_OUT') {
          await pushNotificationService.removeFCMToken();
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Initialize push notifications if user is already logged in
      if (session?.user) {
        await pushNotificationService.initialize();
      }
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes - No Auth Required (Browsing) */}
      <Route path="/" element={<Home />} />
      <Route path="/opgs" element={<OPGsList />} />
      <Route path="/opg/:id" element={<OPGProfile />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/map" element={<MapView />} />

      {/* Auth Routes - Redirect to home if logged in */}
      <Route path="/welcome" element={user ? <Navigate to="/" /> : <Welcome />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/register/buyer" element={user ? <Navigate to="/" /> : <RegisterBuyer />} />
      <Route path="/register/seller" element={user ? <Navigate to="/" /> : <RegisterSeller />} />

      {/* Protected Routes - Auth Required */}
      <Route path="/setup/location" element={<ProtectedRoute><SetupLocation /></ProtectedRoute>} />
      <Route path="/setup/profile" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ChatThread /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      <Route path="/dashboard/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

      {/* Information Pages - Public */}
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<Help />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
