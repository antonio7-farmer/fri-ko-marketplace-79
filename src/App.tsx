import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { pushNotificationService } from "@/services/pushNotifications";

// Eager load auth pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterBuyer from "./pages/RegisterBuyer";
import RegisterSeller from "./pages/RegisterSeller";
import SetupLocation from "./pages/setup/SetupLocation";
import SetupProfile from "./pages/setup/SetupProfile";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load main app pages
const Home = lazy(() => import("./pages/Home"));
const OPGsList = lazy(() => import("./pages/OPGsList"));
const OPGProfile = lazy(() => import("./pages/OPGProfile"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const MapView = lazy(() => import("./pages/MapView"));
const Conversations = lazy(() => import("./pages/Conversations"));
const ChatThread = lazy(() => import("./pages/ChatThread"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Reservations = lazy(() => import("./pages/Reservations"));
const Favorites = lazy(() => import("./pages/Favorites"));
const About = lazy(() => import("./pages/About"));
const Help = lazy(() => import("./pages/Help"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle Android back button
  useAndroidBackButton();

  useEffect(() => {
    console.log('🚀 APP STARTING - initializing push notifications...');
    // Initialize push notifications immediately (channel creation and basic setup)
    pushNotificationService.initialize().catch(err => {
      console.error('Push notification init failed:', err);
    });

    console.log('🔐 SETTING UP AUTH LISTENER...');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AUTH STATE CHANGE:', event, 'User:', session?.user?.email, 'Session exists:', !!session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle FCM token management based on auth state
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, FCM token will be saved on registration');
        }

        // Remove FCM token when user logs out (non-blocking)
        if (event === 'SIGNED_OUT') {
          pushNotificationService.removeFCMToken().catch(() => {});
        }
      }
    );

    console.log('🔍 CHECKING EXISTING SESSION...');
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 SESSION CHECK RESULT:', 'User:', session?.user?.email, 'Session exists:', !!session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        console.log('✅ User already logged in, FCM token will be saved on registration');
      } else {
        console.log('❌ NO EXISTING SESSION - user not logged in');
      }
    }).catch((error) => {
      console.log('❌ SESSION CHECK ERROR:', error);
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    }>
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
    </Suspense>
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
