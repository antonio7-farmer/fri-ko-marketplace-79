# Push Notifications Setup Guide

## ✅ What's Already Done

1. **Firebase FCM Setup** - Project created, `google-services.json` added
2. **App Integration** - Push notifications plugin installed and configured
3. **Database Tables** - `fcm_tokens` and `notification_queue` tables created
4. **Automatic Triggers** - Notifications queued for:
   - New messages
   - Reservation updates (confirmed, cancelled, completed)
   - Products back in stock

## 📋 Remaining Steps

### Step 1: Apply Database Migration

Run this SQL in Supabase SQL Editor:

```bash
# Copy content from: supabase/migrations/20251229000001_add_notification_triggers.sql
```

### Step 2: Get Firebase Server Key

1. Go to **Firebase Console** → Your Project
2. Click **⚙️ Settings** → **Project settings**
3. Go to **Cloud Messaging** tab
4. Find **Server key** under **Cloud Messaging API (Legacy)**
5. **Important**: If you don't see the Server key:
   - Go to **Google Cloud Console**
   - Enable **Firebase Cloud Messaging API**
   - Return to Firebase Console and refresh

### Step 3: Deploy Supabase Edge Function

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set FCM Server Key as secret
supabase secrets set FCM_SERVER_KEY=YOUR_FIREBASE_SERVER_KEY

# Deploy the function
supabase functions deploy send-notification
```

### Step 4: Set Up Automatic Notification Sending

**Option A: Database Webhook (Recommended)**

Create a webhook in Supabase:

1. Go to **Database** → **Webhooks**
2. Click **Create a new hook**
3. **Table**: `notification_queue`
4. **Events**: `INSERT`
5. **Type**: `Supabase Edge Function`
6. **Function**: `send-notification`

**Option B: Cron Job**

Set up a cron job to check for pending notifications every minute:

```bash
# In Supabase Dashboard → Edge Functions → Cron
# Schedule: */1 * * * * (every minute)
# Function: send-notification
```

## 🧪 Testing Notifications

### Test in App

1. Install the new APK on your Android device
2. Log in to your account
3. Grant notification permission when prompted
4. Check Supabase `fcm_tokens` table - your token should appear

### Test Notification Triggers

**Test Message Notification:**
```sql
-- Send a test message (replace IDs with real ones)
INSERT INTO messages (sender_id, receiver_id, content, read)
VALUES (
  'sender_user_id',
  'your_user_id',
  'Test notification!',
  false
);
```

**Test Reservation Notification:**
```sql
-- Update reservation status
UPDATE reservations
SET status = 'confirmed'
WHERE id = 'some_reservation_id';
```

**Test Product Stock Notification:**
```sql
-- Change product from out of stock to available
UPDATE products
SET stock_status = 'available'
WHERE id = 'some_product_id'
AND stock_status = 'out';
```

### Manual Test via Edge Function

```bash
# Call the function manually
curl -X POST https://your-project.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 📊 Monitoring

### Check Notification Queue

```sql
-- See pending notifications
SELECT * FROM notification_queue WHERE sent = false;

-- See sent notifications
SELECT * FROM notification_queue WHERE sent = true ORDER BY created_at DESC LIMIT 10;
```

### Check FCM Tokens

```sql
-- See all registered devices
SELECT
  u.email,
  t.platform,
  t.created_at
FROM fcm_tokens t
JOIN auth.users u ON u.id = t.user_id
ORDER BY t.created_at DESC;
```

## 🔧 Troubleshooting

### Notifications Not Received

1. **Check FCM token registered**:
   ```sql
   SELECT * FROM fcm_tokens WHERE user_id = 'your_user_id';
   ```

2. **Check notification was queued**:
   ```sql
   SELECT * FROM notification_queue WHERE user_id = 'your_user_id' ORDER BY created_at DESC;
   ```

3. **Check Edge Function logs** in Supabase Dashboard

4. **Verify Firebase Server Key** is correct

5. **Check Android permission** - Settings → Apps → Friško → Notifications (should be enabled)

### Edge Function Errors

- **401 Unauthorized**: Check FCM Server Key
- **Connection timeout**: Enable Firebase Cloud Messaging API in Google Cloud Console
- **No tokens found**: User needs to log in on device first

## 🎯 Notification Types

### Messages
- **Trigger**: New message received
- **Recipient**: Message receiver
- **Action**: Opens /messages

### Reservations
- **Trigger**:
  - New reservation → notifies seller
  - Status change → notifies buyer
- **Action**: Opens /reservations

### Products
- **Trigger**: Product goes from 'out' to 'available'
- **Recipient**: Users who favorited the seller
- **Action**: Opens /product/:id

## 🚀 Going Live

Before production:

1. ✅ Test all notification types
2. ✅ Set up proper cron job or webhook
3. ✅ Monitor for a few days
4. ⚠️ Consider rate limiting (max notifications per user per day)
5. ⚠️ Add notification preferences in user settings
6. ✅ Clean up old sent notifications periodically

## 💡 Future Enhancements

- [ ] Notification preferences (allow users to disable specific types)
- [ ] Notification history page in app
- [ ] Rich notifications with images
- [ ] Notification grouping
- [ ] Deep linking to specific content
- [ ] Analytics tracking (open rate, etc.)
