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
      console.log('🔔 Initializing push notifications...');

      // Create notification channel for Android FIRST (required for Android 8.0+)
      if (Capacitor.getPlatform() === 'android') {
        console.log('📱 Creating Android notification channel...');
        try {
          await PushNotifications.createChannel({
            id: 'default',
            name: 'Frisko Notifications',
            description: 'Notifications for Frisko marketplace',
            importance: 4, // Default importance (should show notification)
            visibility: 1, // Public
            sound: 'default',
            vibration: true,
            lights: true,
          });
          console.log('✅ Android notification channel created successfully');
        } catch (channelError) {
          console.error('❌ Failed to create notification channel:', channelError);
          // Continue anyway - channel might already exist
        }
      }

      console.log('🔔 Requesting push notification permissions...');

      // Request permission to use push notifications
      const permStatus = await PushNotifications.requestPermissions();
      console.log('🔔 Permission status:', permStatus);

      if (permStatus.receive === 'granted') {
        console.log('✅ Permission granted, registering with FCM...');

        // Register with FCM
        await PushNotifications.register();
        console.log('✅ Registration called');

        // Set up listeners
        this.setupListeners();

        this.isInitialized = true;

        console.log('✅ Push notifications initialized successfully');
      } else {
        console.warn('⚠️ Permission not granted:', permStatus.receive);
      }
    } catch (error) {
      console.error('❌ Push notification initialization error:', error);
      toast.error('Greška pri inicijalizaciji notifikacija: ' + (error as Error).message);
    }
  }

  private setupListeners() {
    // Handle successful registration
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('✅ FCM token received:', token.value.substring(0, 50) + '...');
      await this.saveFCMToken(token.value);
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Registration error:', error);
      toast.error('Greška pri registraciji notifikacija');
    });

    // Handle incoming notifications when app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('📨 PUSH NOTIFICATION RECEIVED:', {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          id: notification.id,
        });
        
        // Show toast when app is in foreground
        toast.info(notification.title || 'Nova obavijest', {
          description: notification.body,
          duration: 5000,
        });
        
        console.log('✅ Toast notification shown to user');
      }
    );

    // Handle notification tap
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('👆 NOTIFICATION TAPPED:', {
          actionId: notification.actionId,
          notification: {
            title: notification.notification.title,
            body: notification.notification.body,
            data: notification.notification.data,
          }
        });
        
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
      console.log('💾 Saving FCM token to database...');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('⚠️ No user found, cannot save FCM token');
        return;
      }

      // Get device info
      const deviceId = await this.getDeviceId();
      console.log('📱 Device ID:', deviceId);

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
        console.error('❌ Error saving FCM token:', error);
        throw error;
      }

      console.log('✅ FCM token saved successfully to database');
      toast.success('Notifikacije omogućene');
    } catch (error) {
      console.error('❌ Failed to save FCM token:', error);
      toast.error('Greška pri spremanju FCM tokena');
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
