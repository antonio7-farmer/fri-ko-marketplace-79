// Supabase Edge Function to send FCM push notifications via Firebase Cloud Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Your Firebase Cloud Function URL (will be available after deployment)
const FIREBASE_FUNCTION_URL = Deno.env.get('FIREBASE_FUNCTION_URL') || '';
const FIREBASE_AUTH_TOKEN = Deno.env.get('FIREBASE_AUTH_TOKEN') || '';

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
          // Mark as sent even if no tokens (user doesn't have push enabled)
          await supabaseClient
            .from('notification_queue')
            .update({ sent: true })
            .eq('id', notification.id);

          results.push({
            id: notification.id,
            status: 'skipped',
            reason: 'no_tokens'
          });
          continue;
        }

        // Send to all user's devices
        const fcmPromises = tokens.map(({ token }) =>
          sendFCMNotification(token, notification)
        );

        const fcmResults = await Promise.allSettled(fcmPromises);

        // Mark notification as sent
        await supabaseClient
          .from('notification_queue')
          .update({ sent: true })
          .eq('id', notification.id);

        results.push({
          id: notification.id,
          status: 'sent',
          devices: fcmResults.length,
          successes: fcmResults.filter(r => r.status === 'fulfilled').length,
          failures: fcmResults.filter(r => r.status === 'rejected').length,
        });

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        results.push({
          id: notification.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        processed: notifications.length,
        results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendFCMNotification(token: string, notification: any) {
  // Call Firebase Cloud Function to send notification
  const response = await fetch(FIREBASE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREBASE_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      token: token,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firebase function request failed: ${error}`);
  }

  return response.json();
}
