'use client';

import { useState } from 'react';

export default function TranscriptDisplay({ transcript, title }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!transcript) {
    return null;
  }
  
  // Limit display length for collapsed view
  const maxLength = 300;
  const isLongTranscript = transcript.length > maxLength;
  const displayText = isExpanded || !isLongTranscript 
    ? transcript 
    : transcript.substring(0, maxLength) + '...';
  
  return (
    <div className="transcript-display bg-white p-4 rounded-lg shadow-md mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Transcript: {title || 'Audio'}</h3>
        
        {isLongTranscript && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
      
      <div className="transcript-text text-gray-700 whitespace-pre-line">
        {displayText}
      </div>
    </div>
  );
}
