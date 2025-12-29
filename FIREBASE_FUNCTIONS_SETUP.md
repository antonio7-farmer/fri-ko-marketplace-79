# Firebase Cloud Functions Setup (No Service Account Needed!)

This approach uses Firebase Cloud Functions which already have built-in credentials.

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

## Step 3: Initialize Firebase Functions

```bash
cd firebase-functions
npm install
```

## Step 4: Initialize Firebase in Your Project

```bash
# Go back to project root
cd ..

# Initialize Firebase (if not already done)
firebase init functions

# When asked:
# - Use an existing project → Select "Frisko"
# - Language → JavaScript
# - ESLint → No (or Yes, up to you)
# - Install dependencies → Yes
```

## Step 5: Copy the Function Code

The function code is already in `firebase-functions/send-notification.js`

Copy it to the Firebase functions directory:

```bash
# Windows
copy firebase-functions\send-notification.js functions\index.js
copy firebase-functions\package.json functions\package.json

# Or manually copy the files to the functions/ folder
```

## Step 6: Deploy to Firebase

```bash
firebase deploy --only functions
```

After deployment, you'll see output like:
```
✔  functions[sendNotification(us-central1)]: Successful create operation.
Function URL: https://us-central1-frisko-xxxx.cloudfunctions.net/sendNotification
```

**Copy this URL!** You'll need it for Supabase.

## Step 7: Configure Supabase Edge Function

Set the Firebase Function URL in Supabase:

```bash
supabase secrets set FIREBASE_FUNCTION_URL=https://us-central1-frisko-xxxx.cloudfunctions.net/sendNotification
```

## Step 8: Apply Database Migrations

In Supabase SQL Editor, run:

```sql
-- Copy content from: supabase/migrations/20251229000001_add_notification_triggers.sql
```

## Step 9: Deploy Supabase Edge Function

```bash
supabase functions deploy send-notification
```

## Step 10: Set Up Database Webhook

In Supabase Dashboard → Database → Webhooks:
- **Table**: `notification_queue`
- **Event**: `INSERT`
- **Type**: `Supabase Edge Function`
- **Function**: `send-notification`

## Testing

### Test Firebase Function Directly

```bash
curl -X POST https://your-function-url.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN",
    "title": "Test",
    "body": "Test notification"
  }'
```

### Test Full Flow

1. Install APK on Android device
2. Log in
3. Check `fcm_tokens` table in Supabase - token should appear
4. Send test message:

```sql
INSERT INTO messages (sender_id, receiver_id, content, read)
VALUES (
  'sender_user_id',
  'your_user_id',
  'Test notification!',
  false
);
```

5. Notification should appear on device!

## Troubleshooting

### "Permission denied" when deploying
```bash
firebase login --reauth
```

### Function not found after deploy
Wait 1-2 minutes for propagation, then try again.

### Notifications not sending
1. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. Check Supabase Edge Function logs in Dashboard

3. Verify `fcm_tokens` table has tokens

4. Check `notification_queue` table for pending notifications

## Cost

Firebase Cloud Functions:
- **Free tier**: 2M invocations/month
- **Cost after**: $0.40 per million invocations

For a small app, this will likely stay free forever.

## Next Steps

Once working, you can:
- Add notification preferences
- Add analytics
- Implement notification history
- Add rich notifications with images
