# Database Migrations

## How to Apply the Conversations Optimization

The SQL function in `get_user_conversations.sql` needs to be created in your Supabase database.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `get_user_conversations.sql`
5. Paste into the editor
6. Click **Run** to execute

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply migration manually
supabase db execute -f supabase/migrations/get_user_conversations.sql
```

### What This Does

This creates a PostgreSQL function that optimizes conversation loading:

- **Before:** 31 database queries for 10 conversations (1 + 3×N pattern)
- **After:** 1 single optimized query (97% reduction)

The function is already integrated in the codebase (`Conversations.tsx` line 67), so once you run the SQL, the optimization will work immediately.

### Verification

After running the migration, you can verify it worked by:

1. Opening the Conversations page in your app
2. Checking the Network tab in browser dev tools
3. You should see only 1 RPC call to `get_user_conversations` instead of multiple queries

### Rollback

If you need to remove the function:

```sql
DROP FUNCTION IF EXISTS get_user_conversations(UUID);
```

Note: The app will fall back to the old implementation if the function doesn't exist (you'll just lose the performance benefit).
