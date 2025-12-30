-- Create optimized function to get user conversations
-- This replaces the N+1 query pattern (31 queries) with a single efficient query

CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
  partner_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  verified BOOLEAN,
  last_message JSONB,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as partner_id,
    p.display_name,
    p.avatar_url,
    p.verified,
    (
      SELECT row_to_json(m.*)
      FROM messages m
      WHERE (m.sender_id = p.id AND m.receiver_id = user_id)
         OR (m.sender_id = user_id AND m.receiver_id = p.id)
      ORDER BY m.created_at DESC
      LIMIT 1
    )::JSONB as last_message,
    (
      SELECT COUNT(*)
      FROM messages
      WHERE sender_id = p.id
        AND receiver_id = user_id
        AND read = false
    ) as unread_count
  FROM profiles p
  WHERE p.id IN (
    SELECT DISTINCT CASE
      WHEN sender_id = user_id THEN receiver_id
      ELSE sender_id
    END as partner_id
    FROM messages
    WHERE sender_id = user_id OR receiver_id = user_id
  )
  ORDER BY (
    SELECT created_at
    FROM messages m
    WHERE (m.sender_id = p.id AND m.receiver_id = user_id)
       OR (m.sender_id = user_id AND m.receiver_id = p.id)
    ORDER BY created_at DESC
    LIMIT 1
  ) DESC NULLS LAST;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_conversations(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_conversations IS 'Optimized function to retrieve all conversations for a user with last message and unread count. Reduces N+1 query problem from 31 queries to 1.';
