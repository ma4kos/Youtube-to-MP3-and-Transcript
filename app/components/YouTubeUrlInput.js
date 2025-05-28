'use client';

import { useState, useEffect } from 'react';
import { getSessionId } from '../lib/supabase-client';

export default function YouTubeUrlInput({ onSubmit }) {
  const [urls, setUrls] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Get or create session ID on component mount
    const id = getSessionId();
    setSessionId(id);
  }, []);

  const validateUrls = (urlsText) => {
    // Split by newlines and filter out empty lines
    const urlList = urlsText.split('\n').filter(url => url.trim() !== '');
    const errors = [];

    // YouTube URL regex pattern - matches standard YouTube URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;

    urlList.forEach((url, index) => {
      if (!youtubeRegex.test(url.trim())) {
        errors.push({
          line: index + 1,
          url: url.trim(),
          message: 'Invalid YouTube URL format'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      urlList: urlList.map(url => url.trim())
    };
  };

  const handleSubmit = async (conversionType) => {
    setIsValidating(true);
    setValidationErrors([]);

    const { isValid, errors, urlList } = validateUrls(urls);

    if (!isValid) {
      setValidationErrors(errors);
      setIsValidating(false);
      return;
    }

    if (onSubmit && sessionId) {
      try {
        await onSubmit({
          urls: urlList,
          sessionId,
          conversionType
        });
      } catch (error) {
        console.error('Error submitting URLs:', error);
        setValidationErrors([{
          line: 0,
          url: '',
          message: 'Failed to submit URLs for conversion. Please try again.'
        }]);
      }
    }

    setIsValidating(false);
  };

  return (
    <div className="youtube-url-input p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">Enter YouTube URLs</h2>
      <p className="text-gray-600 mb-4">Enter one or multiple YouTube URLs, each on a new line</p>
      
      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=example1&#10;https://www.youtube.com/watch?v=example2"
        rows={5}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isValidating}
      />
      
      {validationErrors.length > 0 && (
        <div className="validation-errors mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p className="font-semibold">Please fix the following errors:</p>
          <ul className="list-disc pl-5 mt-2">
            {validationErrors.map((error, index) => (
              <li key={index}>
                {error.line > 0 ? `Line ${error.line}: ${error.message} - ${error.url}` : error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="conversion-buttons mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleSubmit('mp3')}
          disabled={isValidating || !urls.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? 'Processing...' : 'Convert to MP3'}
        </button>
        
        <button
          onClick={() => handleSubmit('mp3_text')}
          disabled={isValidating || !urls.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? 'Processing...' : 'Convert to MP3 then Text'}
        </button>
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        Note: Processing may take some time depending on video length. You'll see real-time status updates below.
      </p>
    </div>
  );
}
