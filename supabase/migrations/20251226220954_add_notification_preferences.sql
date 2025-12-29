-- Add notification_preferences column to profiles table
-- This allows users to control which notifications they want to receive

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "reservations": true,
  "messages": true,
  "updates": true,
  "marketing": false
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences: reservations, messages, updates, marketing';
