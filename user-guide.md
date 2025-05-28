# YouTube to MP3 and Transcript Converter - User Guide

## Introduction

Welcome to the YouTube to MP3 and Transcript Converter! This application allows you to convert YouTube videos to MP3 audio files and generate text transcripts using Google's Gemini API. This guide will walk you through all the features and functionality of the application.

## Getting Started

### Accessing the Application

The application is deployed at the permanent URL provided by Manus. Simply open this URL in your web browser to start using the application.

### Session Management

The application automatically creates a unique session ID for you, which is stored in your browser's local storage. This ensures that you only see your own conversions, even if multiple users are using the application simultaneously.

## Features

### Converting YouTube Videos to MP3

1. **Enter YouTube URLs**:
   - Paste one or multiple YouTube URLs in the text area
   - Each URL should be on a separate line
   - The application validates URLs to ensure they are in the correct format

2. **Convert to MP3**:
   - Click the "Convert to MP3" button to start the conversion process
   - The application will download the audio from each YouTube video and convert it to MP3 format
   - Real-time status updates will show the progress of each conversion

3. **Download MP3 Files**:
   - Once conversion is complete, a "Download MP3" button will appear for each successful conversion
   - Click this button to download the MP3 file to your device

### Generating Transcripts

1. **Convert to Text**:
   - After an MP3 conversion is complete, click the "Convert to Text" button to generate a transcript
   - The application uses Google's Gemini API to transcribe the audio to text
   - Real-time status updates will show the progress of the transcription

2. **Combined Conversion**:
   - Alternatively, click "Convert to MP3 then Text" to perform both operations in sequence
   - This will first convert the YouTube video to MP3, then automatically generate a transcript

3. **Download Transcripts**:
   - Once transcription is complete, a "Download Transcript" button will appear
   - Click this button to download the transcript as a text file

### Managing Conversions

1. **Viewing Conversions**:
   - All your conversions are listed in the "Your Conversions" section
   - Each conversion shows the video title, URL, and current status

2. **Expanding Details**:
   - Click the "Expand" button on a completed conversion to view more details
   - This shows an audio player for the MP3 and the transcript (if available)

3. **Audio Playback**:
   - Use the built-in audio player to listen to converted MP3 files
   - The player includes play/pause controls and a progress bar

## Status Indicators

The application uses color-coded status badges to indicate the current state of each conversion:

- **Pending**: The conversion is queued and waiting to be processed
- **Converting to MP3**: The YouTube video is being downloaded and converted to MP3
- **Converting to Text**: The MP3 is being transcribed to text
- **Completed**: The conversion has finished successfully
- **Failed**: An error occurred during the conversion process

## Error Handling

If an error occurs during conversion or transcription, the application will:

1. Display an error message explaining what went wrong
2. Mark the conversion as "Failed" with details about the error
3. Allow you to retry the operation where possible

Common errors include:
- Invalid YouTube URLs
- Unavailable or private videos
- Network connectivity issues
- API rate limit exceeded

## Tips for Best Results

1. **Video Selection**:
   - Choose videos with clear audio for better transcription quality
   - Shorter videos process faster than very long ones

2. **Batch Processing**:
   - You can enter multiple URLs at once for batch processing
   - URLs are processed sequentially to ensure optimal performance

3. **Transcription Quality**:
   - Transcription accuracy depends on audio quality and clarity
   - Background noise or music may reduce transcription accuracy

## Privacy and Data Storage

- All MP3 files and transcripts are stored securely in Supabase storage
- Files are only accessible to users with the correct session ID
- No personal data is collected beyond what's necessary for the application to function

## Support and Feedback

If you encounter any issues or have suggestions for improvement, please contact the application administrator.
