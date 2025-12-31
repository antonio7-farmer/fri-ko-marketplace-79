// Supabase Edge Function to send FCM notifications using Firebase Admin SDK
import { createClient } from 'npm:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@8.7.0'

// Firebase credentials from environment
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') || ''
const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL') || ''
const FIREBASE_PRIVATE_KEY = Deno.env.get('FIREBASE_PRIVATE_KEY') || ''

interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  data?: Record<string, string>
  sent: boolean
  created_at: string
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  try {
    // Get pending notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('sent', false)
      .limit(100)

    if (fetchError) throw fetchError

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notifications to send' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    // Get OAuth2 access token once for all notifications
    const accessToken = await getAccessToken({
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    })

    // Process each notification
    for (const notification of notifications) {
      try {
        // Get FCM tokens for this user
        const { data: tokens, error: tokenError } = await supabase
          .from('fcm_tokens')
          .select('token')
          .eq('user_id', notification.user_id)

        if (tokenError) throw tokenError

        if (!tokens || tokens.length === 0) {
          // Mark as sent even if no tokens
          await supabase
            .from('notification_queue')
            .update({ sent: true })
            .eq('id', notification.id)

          results.push({ notification_id: notification.id, status: 'no_tokens' })
          continue
        }

        // Send to each token
        for (const tokenRecord of tokens) {
          try {
            await sendFCMNotification(
              accessToken,
              tokenRecord.token,
              notification
            )
            results.push({
              notification_id: notification.id,
              token: tokenRecord.token.substring(0, 20) + '...',
              status: 'sent'
            })
          } catch (error) {
            console.error('Error sending to token:', error)
            results.push({
              notification_id: notification.id,
              token: tokenRecord.token.substring(0, 20) + '...',
              status: 'error',
              error: error instanceof Error ? error.message : String(error)
            })
          }
        }

        // Mark notification as sent
        await supabase
          .from('notification_queue')
          .update({ sent: true })
          .eq('id', notification.id)

      } catch (error) {
        console.error('Error processing notification:', error)
        results.push({
          notification_id: notification.id,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

async function sendFCMNotification(
  accessToken: string,
  fcmToken: string,
  notification: Notification
) {
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`

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
  }

  const response = await fetch(fcmUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`FCM request failed: ${error}`)
  }

  return response.json()
}

// Get OAuth2 access token using service account
const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string
  privateKey: string
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens!.access_token!)
    })
  })
}
