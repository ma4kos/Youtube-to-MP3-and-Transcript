'use client';

import { useState } from 'react';

export default function AudioPlayer({ mp3Url, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  
  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };
  
  const handlePlayPause = () => {
    const audioElement = document.getElementById('audio-player');
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (e) => {
    const audioElement = document.getElementById('audio-player');
    const seekTime = parseFloat(e.target.value);
    audioElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  return (
    <div className="audio-player bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-medium mb-2">{title || 'Audio Player'}</h3>
      
      <audio 
        id="audio-player"
        src={mp3Url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <div className="controls flex items-center space-x-2">
        <button 
          onClick={handlePlayPause}
          className="play-pause-btn w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="time-display text-sm text-gray-500 w-16">
          {formatTime(currentTime)}
        </div>
        
        <input 
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        
        <div className="time-display text-sm text-gray-500 w-16 text-right">
          {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
