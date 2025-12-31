# Download Firebase Service Account Key

## Steps to Download

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/project/frisko-marketplace/settings/serviceaccounts/adminsdk
   - Or: Firebase Console → ⚙️ Settings → Project Settings → Service Accounts tab

2. **Generate New Private Key**
   - Click on **"Generate new private key"** button
   - A dialog will appear warning you to keep it secure
   - Click **"Generate key"**
   - A JSON file will download automatically (e.g., `frisko-marketplace-firebase-adminsdk-xxxxx.json`)

3. **Save the File**
   - Rename it to: `service-account.json`
   - Save it in: `supabase/functions/send-fcm-notification/service-account.json`

## ⚠️ Security Warning

- **NEVER commit this file to git!**
- It's already in `.gitignore`
- This file contains sensitive credentials
- Anyone with this file can access your Firebase project

## What's Next

After downloading the file, let me know and I'll:
1. Update the Edge Function code to use proper OAuth2 authentication
2. Deploy the updated function
3. Test push notifications
