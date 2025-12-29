// Supabase Edge Function to send FCM notifications using Firebase Admin SDK
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Firebase project details
const FIREBASE_PROJECT_ID = 'frisko-ebfac';
const FIREBASE_WEB_API_KEY = Deno.env.get('FIREBASE_WEB_API_KEY') || '';

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending notifications
    const { data: notifications, error: fetchError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('sent', false)
      .limit(100);

    if (fetchError) throw fetchError;

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notifications to send' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Process each notification
    for (const notification of notifications) {
      try {
        // Get FCM tokens for this user
        const { data: tokens, error: tokenError } = await supabaseClient
          .from('fcm_tokens')
          .select('token')
          .eq('user_id', notification.user_id);

        if (tokenError) throw tokenError;

        if (!tokens || tokens.length === 0) {
          // Mark as sent even if no tokens
          await supabaseClient
            .from('notification_queue')
            .update({ sent: true })
            .eq('id', notification.id);

          results.push({ notification_id: notification.id, status: 'no_tokens' });
          continue;
        }

        // Send to each token
        for (const tokenRecord of tokens) {
          try {
            await sendFCMNotification(tokenRecord.token, notification);
            results.push({
              notification_id: notification.id,
              token: tokenRecord.token.substring(0, 20) + '...',
              status: 'sent'
            });
          } catch (error) {
            console.error('Error sending to token:', error);
            results.push({
              notification_id: notification.id,
              token: tokenRecord.token.substring(0, 20) + '...',
              status: 'error',
              error: error.message
            });
          }
        }

        // Mark notification as sent
        await supabaseClient
          .from('notification_queue')
          .update({ sent: true })
          .eq('id', notification.id);

      } catch (error) {
        console.error('Error processing notification:', error);
        results.push({
          notification_id: notification.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendFCMNotification(fcmToken: string, notification: any) {
  // Use FCM HTTP v1 API
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

  const message = {
    message: {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    },
  };

  // Get OAuth2 access token
  const accessToken = await getAccessToken();

  const response = await fetch(fcmUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FCM request failed: ${error}`);
  }

  return response.json();
}

// Get OAuth2 access token using service account
async function getAccessToken(): Promise<string> {
  // For now, we'll use a simpler approach with the legacy API
  // This is a temporary solution - ideally we'd use service account auth
  return FIREBASE_WEB_API_KEY;
}
