-- Add new columns for enhanced profile details

-- Working hours: structured JSON to store open/close times for days
-- Example: {"monday": {"open": "08:00", "close": "16:00"}, "tuesday": ...}
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}'::jsonb;

-- Social media links (optional, but good for profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Sales channels: Markets and physical sales points
-- We can store this as a JSON array or separate text columns.
-- Let's use specific text columns for simplicity in searching/filtering later, 
-- or JSONB if we want structured lists.
-- Given user request "unos tržnice" (maybe multiple?) and "prodajnog mjesta",
-- let's use JSONB arrays for flexibility.
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS markets JSONB DEFAULT '[]'::jsonb;
-- Example: [{"name": "Dolac", "days": "Pet-Sub"}, {"name": "Kvatrić", "days": "Ned"}]

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sales_points JSONB DEFAULT '[]'::jsonb;
-- Example: [{"address": "Na farmi, Ulica 1", "note": "Nazvati prije dolaska"}]

-- Force RLS policy update if needed (usually automatic for new columns but good to check)
-- Existing policies "Users can update own profile" should cover these new columns automatically.
