import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    try {
      // Request permission to use push notifications
      const permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        // Register with FCM
        await PushNotifications.register();

        // Set up listeners
        this.setupListeners();

        this.isInitialized = true;
        console.log('Push notifications initialized successfully');
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private setupListeners() {
    // Handle successful registration
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      await this.saveFCMToken(token.value);
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
      toast.error('Greška pri registraciji notifikacija');
    });

    // Handle incoming notifications when app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);

        // Show toast when app is in foreground
        toast.info(notification.title || 'Nova obavijest', {
          description: notification.body,
          duration: 5000,
        });
      }
    );

    // Handle notification tap
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action performed:', notification);

        // You can handle navigation here based on notification data
        const data = notification.notification.data;
        if (data?.route) {
          // Navigate to specific route
          window.location.href = data.route;
        }
      }
    );
  }

  private async saveFCMToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user logged in, skipping token save');
        return;
      }

      // Get device info
      const deviceId = await this.getDeviceId();

      // Upsert token (insert or update if exists)
      const { error } = await supabase
        .from('fcm_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          device_id: deviceId,
          platform: 'android',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,token'
        });

      if (error) {
        console.error('Error saving FCM token:', error);
        throw error;
      }

      console.log('FCM token saved successfully');
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  private async getDeviceId(): Promise<string> {
    // You can use Device plugin for more info
    // For now, generate a simple device identifier
    const stored = localStorage.getItem('device_id');
    if (stored) return stored;

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
    return deviceId;
  }

  async removeFCMToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Remove all tokens for this user on this device
      const deviceId = await this.getDeviceId();

      const { error } = await supabase
        .from('fcm_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('device_id', deviceId);

      if (error) throw error;

      console.log('FCM token removed successfully');
    } catch (error) {
      console.error('Failed to remove FCM token:', error);
    }
  }

  async checkPermissions() {
    const permStatus = await PushNotifications.checkPermissions();
    return permStatus.receive === 'granted';
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
