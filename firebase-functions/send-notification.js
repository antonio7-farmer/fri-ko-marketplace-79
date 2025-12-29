// Firebase Cloud Function to send FCM notifications
// This runs on Firebase and has built-in credentials

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (automatically uses service account in Firebase environment)
admin.initializeApp();

exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
      res.status(400).json({ error: 'Missing required fields: token, title, body' });
      return;
    }

    // Prepare FCM message
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    };

    // Send notification
    const response = await admin.messaging().send(message);

    res.status(200).json({
      success: true,
      messageId: response,
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
    });
  }
});

// Batch send function (send to multiple tokens)
exports.sendBatchNotification = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { tokens, title, body, data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      res.status(400).json({ error: 'Missing or invalid tokens array' });
      return;
    }

    if (!title || !body) {
      res.status(400).json({ error: 'Missing required fields: title, body' });
      return;
    }

    // Prepare multicast message
    const message = {
      tokens: tokens.slice(0, 500), // FCM limit is 500 tokens per batch
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    };

    // Send to multiple devices
    const response = await admin.messaging().sendMulticast(message);

    res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      results: response.responses.map((r, i) => ({
        token: tokens[i],
        success: r.success,
        error: r.error?.message,
      })),
    });

  } catch (error) {
    console.error('Error sending batch notification:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
    });
  }
});
