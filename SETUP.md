# Frisko Marketplace Setup Guide

## Prerequisites
- Node.js (v20 or higher)
- Firebase account
- Supabase account
- Android development environment

## Configuration Files

### 1. Environment Variables (.env)
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env` with your values:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/public key

### 2. Firebase Configuration

#### google-services.json
Download `google-services.json` from your Firebase Console:
1. Go to Firebase Console > Project Settings
2. Download `google-services.json` for Android
3. Place it in two locations:
   - Root directory: `google-services.json`
   - Android app directory: `android/app/google-services.json`

#### Firebase Cloud Functions
The Firebase Functions require an authentication token:

1. Deploy the functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

2. Set the auth token:
```bash
firebase functions:config:set auth.token="YOUR_SECURE_TOKEN"
firebase deploy --only functions
```

3. Add the token to your Supabase Edge Function secrets:
```bash
FIREBASE_AUTH_TOKEN=YOUR_SECURE_TOKEN
FIREBASE_FUNCTION_URL=https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/sendNotification
```

## Database Setup

Run the Supabase migrations:
```bash
supabase migration up
```

This will create:
- `fcm_tokens` table for storing device tokens
- `notification_queue` table for queued notifications
- Database triggers for automatic notifications

## Push Notifications Setup

### Android
1. Ensure `google-services.json` is in `android/app/`
2. Build the Android app:
```bash
npm run build
cd android
./gradlew assembleDebug
```

### iOS (if applicable)
Configure push notifications in Xcode with your Apple Developer account.

## Running the App

### Web Development
```bash
npm install
npm run dev
```

### Android Build
```bash
npm run build
cd android
./gradlew assembleDebug
```

## Testing Push Notifications

1. Register a test device by logging in to the app
2. Trigger a notification by:
   - Sending a message to another user
   - Creating/updating a reservation
   - Marking a product as available (when users have favorited the seller)

3. Check the notification queue:
```sql
SELECT * FROM notification_queue WHERE sent = false;
```

4. Manually trigger the send function:
```bash
curl -X POST https://YOUR-SUPABASE-PROJECT.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

## Security Notes

- Never commit `google-services.json` to git
- Never commit `.env` files
- Keep Firebase auth tokens secure
- Use environment variables for all sensitive data
