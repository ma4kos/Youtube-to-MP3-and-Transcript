YouTube to MP3 and Transcript Converter
A Next.js application that converts YouTube videos to MP3 audio files and generates text transcripts using Google's Gemini API.
Features
Multi-URL input with validation
MP3 conversion with streaming approach
Transcription using Google Gemini API
Real-time status updates via Supabase
Audio playback and transcript display
Comprehensive error handling
Tech Stack
Frontend: Next.js with App Router
Backend: Next.js API Routes
Database & Storage: Supabase
Speech-to-Text: Google Gemini API
YouTube Download: ytdl-core
Audio Conversion: fluent-ffmpeg
Prerequisites
Node.js (v16+)
Python 3.8+ (for Gemini API)
Supabase account
Google Gemini API key
Environment Setup
Create a .env file in the root directory with the following variables:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
Supabase Setup
Create a new Supabase project
Create a conversions table with the schema in app/lib/supabase-schema.js
Create an audio-files storage bucket
Enable Realtime with REPLICA IDENTITY FULL
Installation
bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install google-genai
Development
bash
# Run the development server
npm run dev
Building for Production
bash
# Build the application
npm run build

# Start the production server
npm start
Deployment
See the Deployment Guide for detailed instructions on deploying to production.
Documentation
User Guide - Instructions for end users
Deployment Guide - Deployment instructions
Testing Plan - Comprehensive testing approach
Validation Report - Data accuracy and reliability assessment
License
MIT
