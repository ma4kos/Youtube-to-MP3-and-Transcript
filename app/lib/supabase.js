import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate a session ID if not exists
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
