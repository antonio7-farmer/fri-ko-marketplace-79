-- Create notification queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS notification_queue_user_id_idx ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS notification_queue_sent_idx ON notification_queue(sent);

-- Enable RLS
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_queue
CREATE POLICY "Users can read their own notifications"
  ON notification_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all notifications (for edge functions)
CREATE POLICY "Service role can manage notifications"
  ON notification_queue
  FOR ALL
  USING (true);

-- Function to queue notification for new messages
CREATE OR REPLACE FUNCTION queue_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification if message is unread
  IF NEW.read = FALSE THEN
    -- Get sender info
    INSERT INTO notification_queue (user_id, title, body, data)
    SELECT
      NEW.receiver_id,
      'Nova poruka',
      'Imate novu poruku od ' || COALESCE(p.display_name, 'korisnika'),
      jsonb_build_object(
        'type', 'message',
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'route', '/messages'
      )
    FROM profiles p
    WHERE p.id = NEW.sender_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new messages
DROP TRIGGER IF EXISTS on_new_message_notification ON messages;
CREATE TRIGGER on_new_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION queue_message_notification();

-- Function to queue notification for reservation updates
CREATE OR REPLACE FUNCTION queue_reservation_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  target_user_id UUID;
BEGIN
  -- For new reservations, notify seller
  IF TG_OP = 'INSERT' THEN
    notification_title := 'Nova rezervacija';
    notification_body := 'Imate novu rezervaciju proizvoda';
    target_user_id := NEW.seller_id;

  -- For status updates, notify buyer
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    target_user_id := NEW.buyer_id;

    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Rezervacija potvrđena';
        notification_body := 'Vaša rezervacija je potvrđena';
      WHEN 'cancelled' THEN
        notification_title := 'Rezervacija otkazana';
        notification_body := 'Vaša rezervacija je otkazana';
      WHEN 'completed' THEN
        notification_title := 'Rezervacija dovršena';
        notification_body := 'Vaša rezervacija je dovršena';
      ELSE
        notification_title := 'Ažuriranje rezervacije';
        notification_body := 'Status vaše rezervacije je ažuriran';
    END CASE;
  ELSE
    RETURN NEW;
  END IF;

  -- Queue the notification
  INSERT INTO notification_queue (user_id, title, body, data)
  VALUES (
    target_user_id,
    notification_title,
    notification_body,
    jsonb_build_object(
      'type', 'reservation',
      'reservation_id', NEW.id,
      'status', NEW.status,
      'route', '/reservations'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for reservation changes
DROP TRIGGER IF EXISTS on_reservation_notification ON reservations;
CREATE TRIGGER on_reservation_notification
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION queue_reservation_notification();

-- Function to queue notification when product goes back in stock
CREATE OR REPLACE FUNCTION queue_product_stock_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- If product goes from 'out' to 'available', notify favorited users
  IF OLD.stock_status = 'out' AND NEW.stock_status = 'available' THEN
    -- Insert notification for each user who favorited this seller
    INSERT INTO notification_queue (user_id, title, body, data)
    SELECT
      f.user_id,
      'Proizvod dostupan',
      NEW.title || ' je ponovo dostupan!',
      jsonb_build_object(
        'type', 'product_stock',
        'product_id', NEW.id,
        'seller_id', NEW.seller_id,
        'route', '/product/' || NEW.id
      )
    FROM favorites f
    WHERE f.seller_id = NEW.seller_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for product stock changes
DROP TRIGGER IF EXISTS on_product_stock_notification ON products;
CREATE TRIGGER on_product_stock_notification
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION queue_product_stock_notification();
