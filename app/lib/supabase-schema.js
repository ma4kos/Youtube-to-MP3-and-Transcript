// This file sets up the Supabase database schema for the application

// SQL to create the conversions table
const createConversionsTableSQL = `
CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  youtube_url TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'converting_mp3', 'converting_text', 'completed', 'failed')),
  mp3_file_path TEXT,
  transcript TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create index on session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_conversions_session_id ON public.conversions(session_id);

-- Enable row level security
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- Enable realtime subscriptions with full replica identity
ALTER TABLE public.conversions REPLICA IDENTITY FULL;

-- Create storage bucket for audio files if it doesn't exist
-- Note: This would typically be done via Supabase UI or migrations
`;

// Function to initialize the database schema
export const initializeSupabaseSchema = async (supabase) => {
  try {
    // In a real application, this would be done via Supabase migrations
    // This is included here for documentation purposes
    console.log('Schema initialization would be done via Supabase UI or migrations');
    
    // The following steps would be performed in the Supabase dashboard:
    // 1. Create the conversions table with the schema above
    // 2. Create an 'audio-files' storage bucket with public access
    // 3. Enable realtime subscriptions for the conversions table
    
    return true;
  } catch (error) {
    console.error('Error initializing Supabase schema:', error);
    return false;
  }
};

// Export the SQL for documentation purposes
export const schemaSQL = createConversionsTableSQL;
