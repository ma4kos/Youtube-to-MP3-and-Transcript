'use client';

import { useState, useEffect } from 'react';
import { getSessionId, fetchConversions, subscribeToConversions } from '../lib/supabase-client';
import YouTubeUrlInput from '../components/YouTubeUrlInput';
import AudioPlayer from '../components/AudioPlayer';
import TranscriptDisplay from '../components/TranscriptDisplay';
import ErrorHandler from '../components/ErrorHandler';

export default function Home() {
  const [conversions, setConversions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedConversion, setExpandedConversion] = useState(null);

  useEffect(() => {
    // Get or create session ID
    const id = getSessionId();
    if (id) {
      setSessionId(id);
      
      // Fetch initial conversions
      const loadConversions = async () => {
        try {
          const data = await fetchConversions(id);
          setConversions(data);
        } catch (err) {
          setError({ message: 'Failed to load conversions. Please refresh the page.' });
        } finally {
          setLoading(false);
        }
      };
      
      loadConversions();
      
      // Subscribe to real-time updates
      const subscription = subscribeToConversions(id, (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversions(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setConversions(prev => 
            prev.map(item => item.id === payload.new.id ? payload.new : item)
          );
        } else if (payload.eventType === 'DELETE') {
          setConversions(prev => 
            prev.filter(item => item.id !== payload.old.id)
          );
        }
      });
      
      // Cleanup subscription on unmount
      return () => {
        subscription?.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async ({ urls, sessionId, conversionType }) => {
    setError(null);
    
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          sessionId,
          conversionType
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit conversion request');
      }
      
      // No need to update state here as we're using real-time subscriptions
    } catch (err) {
      setError({ message: err.message || 'Failed to submit URLs for conversion. Please try again.' });
      throw err;
    }
  };

  const handleTextConversion = async (id) => {
    setError(null);
    
    try {
      const response = await fetch(`/api/convert-to-text/${id}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit text conversion request');
      }
      
      // No need to update state here as we're using real-time subscriptions
    } catch (err) {
      setError({ message: err.message || 'Failed to start text conversion. Please try again.' });
    }
  };

  const handleDownload = async (id, type) => {
    try {
      window.open(`/api/download/${id}/${type}`, '_blank');
    } catch (err) {
      setError({ message: 'Failed to download file. Please try again.' });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'converting_mp3': { color: 'bg-blue-100 text-blue-800', text: 'Converting to MP3' },
      'converting_text': { color: 'bg-purple-100 text-purple-800', text: 'Converting to Text' },
      'completed': { color: 'bg-green-100 text-green-800', text: 'Completed' },
      'failed': { color: 'bg-red-100 text-red-800', text: 'Failed' }
    };
    
    const { color, text } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  const toggleExpand = (id) => {
    if (expandedConversion === id) {
      setExpandedConversion(null);
    } else {
      setExpandedConversion(id);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">YouTube to MP3 and Transcript Converter</h1>
        
        {error && (
          <ErrorHandler 
            error={error} 
            onDismiss={() => setError(null)} 
          />
        )}
        
        <YouTubeUrlInput onSubmit={handleSubmit} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Conversions</h2>
          
          {loading ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">Loading your conversions...</p>
            </div>
          ) : conversions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No conversions yet. Enter YouTube URLs above to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversions.map((conversion) => (
                <div key={conversion.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{conversion.title || 'Untitled Video'}</h3>
                      <p className="text-sm text-gray-500 mt-1">{conversion.youtube_url}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(conversion.status)}
                      
                      {conversion.status === 'completed' && conversion.mp3_file_path && (
                        <button
                          onClick={() => toggleExpand(conversion.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedConversion === conversion.id ? 'Collapse' : 'Expand'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {conversion.error_message && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                      Error: {conversion.error_message}
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {conversion.status === 'completed' && conversion.mp3_file_path && (
                      <button
                        onClick={() => handleDownload(conversion.id, 'mp3')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Download MP3
                      </button>
                    )}
                    
                    {conversion.status === 'completed' && conversion.mp3_file_path && !conversion.transcript && (
                      <button
                        onClick={() => handleTextConversion(conversion.id)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Convert to Text
                      </button>
                    )}
                    
                    {conversion.status === 'completed' && conversion.transcript && (
                      <button
                        onClick={() => handleDownload(conversion.id, 'text')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Download Transcript
                      </button>
                    )}
                  </div>
                  
                  {expandedConversion === conversion.id && conversion.mp3_file_path && (
                    <div className="mt-4">
                      <AudioPlayer 
                        mp3Url={`/api/download/${conversion.id}/mp3`}
                        title={conversion.title}
                      />
                      
                      {conversion.transcript && (
                        <TranscriptDisplay 
                          transcript={conversion.transcript}
                          title={conversion.title}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
