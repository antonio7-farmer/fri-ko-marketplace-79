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
      }
    } catch (error) {
      // Silently fail - push notifications are optional
    }
  }

  private setupListeners() {
    // Handle successful registration
    PushNotifications.addListener('registration', async (token: Token) => {
      await this.saveFCMToken(token.value);
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', () => {
      toast.error('Greška pri registraciji notifikacija');
    });

    // Handle incoming notifications when app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
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
        throw error;
      }
    } catch (error) {
      // Silently fail
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
    } catch (error) {
      // Silently fail
    }
  }

  async checkPermissions() {
    const permStatus = await PushNotifications.checkPermissions();
    return permStatus.receive === 'granted';
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
