# YouTube to MP3 and Transcript Converter - Deployment Guide

## Overview

This document provides instructions for deploying the YouTube to MP3 and Transcript Converter application to a production environment using Manus deployment tools. The application is built with Next.js, Supabase, and the Google Gemini API for speech-to-text functionality.

## Prerequisites

Before deployment, ensure you have the following:

1. Supabase account with:
   - Database with `conversions` table created
   - Storage bucket named `audio-files` configured
   - Realtime enabled with `REPLICA IDENTITY FULL`

2. Google Gemini API key for speech-to-text functionality

3. Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://glghaepcxvaousrszvxr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ2hhZXBjeHZhb3VzcnN6dnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzUwMDAsImV4cCI6MjA1ODUxMTAwMH0.WVU9OBUZ_BMu59TBjctUeruHcdwufWIKCezZIB-c9c0
   GEMINI_API_KEY=your-gemini-api-key
   ```

## Deployment Steps

### 1. Build the Application

```bash
# Navigate to the project directory
cd youtube-converter

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Deploy to Production

The application can be deployed using Manus deployment tools for permanent hosting:

```bash
# Deploy using Manus deployment tools
deploy_apply_deployment --type=static --local_dir=/home/ubuntu/youtube-converter/.next
```

This will provide a permanent public URL for the application.

### 3. Verify Deployment

After deployment, verify that:

1. The application is accessible at the provided URL
2. YouTube URL input and validation work correctly
3. MP3 conversion and upload function properly
4. Transcription with Gemini API works as expected
5. Real-time updates and downloads function correctly

## Supabase Configuration

### Database Schema

Create the `conversions` table with the following SQL:

```sql
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
```

### Storage Configuration

1. Create a storage bucket named `audio-files`
2. Set bucket permissions to allow public access for downloads
3. Configure CORS settings to allow requests from your deployed domain

## Google Gemini API Configuration

1. Ensure the `GEMINI_API_KEY` environment variable is set with a valid API key
2. The application uses the `google-genai` Python package for transcription
3. Verify that the API key has sufficient quota for your expected usage

## Troubleshooting

### Common Issues

1. **MP3 Conversion Fails**:
   - Verify that `ytdl-core` and `fluent-ffmpeg` are properly installed
   - Check for YouTube URL restrictions or region blocking
   - Ensure sufficient disk space for temporary files

2. **Transcription Fails**:
   - Verify Gemini API key is valid and has sufficient quota
   - Check network connectivity to Google API endpoints
   - Ensure audio files are properly uploaded to Supabase

3. **Real-time Updates Not Working**:
   - Verify Supabase Realtime is enabled with `REPLICA IDENTITY FULL`
   - Check browser console for WebSocket connection errors
   - Ensure session IDs are properly generated and stored

### Logs and Monitoring

- Check application logs for error messages
- Monitor Supabase usage and quotas
- Track Gemini API usage and rate limits

## Maintenance

### Updates and Upgrades

1. Pull the latest code from the repository
2. Install any new dependencies
3. Build and redeploy following the steps above

### Backup and Recovery

1. Regularly backup the Supabase database
2. Consider implementing a cleanup routine for old MP3 files
3. Document any configuration changes for future reference
