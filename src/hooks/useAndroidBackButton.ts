import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { toast } from 'sonner';

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPress = useRef<number>(0);
  const historyLength = useRef<number>(window.history.length);

  useEffect(() => {
    // Track history changes
    historyLength.current = window.history.length;
  }, [location]);

  useEffect(() => {
    let listenerHandle: any;

    const setupListener = async () => {
      listenerHandle = await CapacitorApp.addListener('backButton', () => {
        // Main bottom navigation routes - these are the app's root tabs
        const mainRoutes = ['/', '/home'];
        const isMainRoute = mainRoutes.includes(location.pathname);

        // Check if we can actually go back in history
        const canNavigateBack = historyLength.current > 1;

        if (isMainRoute) {
          // Double-tap to exit on home screen
          const currentTime = new Date().getTime();
          const timeDiff = currentTime - lastBackPress.current;

          if (timeDiff < 2000) {
            // Double tap detected within 2 seconds - exit app
            CapacitorApp.exitApp();
          } else {
            // First tap - show toast
            lastBackPress.current = currentTime;
            toast.info('Pritisnite ponovno za izlaz', {
              duration: 2000,
            });
          }
        } else if (canNavigateBack) {
          // Navigate back in history
          navigate(-1);
        } else {
          // No history to go back to - go to home
          navigate('/');
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, location]);
};
