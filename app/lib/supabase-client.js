// This file configures Supabase client and provides helper functions
// for session management and real-time subscriptions

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate or retrieve a session ID
export const getSessionId = () => {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('youtube_converter_session_id');
    
    if (!sessionId) {
      // Generate a UUID v4
      sessionId = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      localStorage.setItem('youtube_converter_session_id', sessionId);
    }
    
    return sessionId;
  }
  return null;
};

// Subscribe to realtime updates for a session
export const subscribeToConversions = (sessionId, callback) => {
  if (!sessionId) return null;
  
  const subscription = supabase
    .channel('conversions_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversions',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
    
  return subscription;
};

// Fetch conversions for a session
export const fetchConversions = async (sessionId) => {
  if (!sessionId) return [];
  
  const { data, error } = await supabase
    .from('conversions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching conversions:', error);
    return [];
  }
  
  return data || [];
};

// Helper to generate a signed URL for MP3 download
export const getSignedUrl = async (filePath) => {
  const { data, error } = await supabase
    .storage
    .from('audio-files')
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
    
  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
  
  return data?.signedUrl;
};

// Initialize Supabase schema if needed (for development)
export const initializeSchema = async () => {
  // This would typically be done via Supabase migrations
  // but included here for completeness
  
  // Check if conversions table exists
  const { error } = await supabase
    .from('conversions')
    .select('id')
    .limit(1);
    
  if (error && error.code === '42P01') { // Table doesn't exist
    console.log('Initializing schema...');
    
    // Create conversions table
    const { error: createError } = await supabase.rpc('create_conversions_table');
    
    if (createError) {
      console.error('Error creating schema:', createError);
    } else {
      console.log('Schema initialized successfully');
    }
  }
};
