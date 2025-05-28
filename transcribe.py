# Python script for Gemini API speech-to-text integration
# This script handles the transcription of MP3 files using the Gemini API

import os
import sys
import tempfile
import json
from google import genai
from google.genai import types

# Configure Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

def transcribe_audio(audio_file_path):
    """
    Transcribe audio file using Gemini API
    
    Args:
        audio_file_path: Path to the audio file
        
    Returns:
        Transcription text
    """
    try:
        # Initialize Gemini client
        client = genai.Client()
        
        # Load audio file
        with open(audio_file_path, 'rb') as f:
            audio_data = f.read()
        
        # Create a file object for Gemini API
        audio_file = client.files.upload(file=audio_file_path)
        
        # Generate transcription using Gemini API
        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=["Please transcribe this audio file accurately:", audio_file]
        )
        
        # Extract and return transcription text
        return response.text
        
    except Exception as e:
        print(f"Error in transcribe_audio: {str(e)}")
        raise e

def process_audio_in_chunks(audio_file_path, chunk_size_mb=10):
    """
    Process large audio files in chunks to manage memory usage
    
    Args:
        audio_file_path: Path to the audio file
        chunk_size_mb: Size of each chunk in MB
        
    Returns:
        Combined transcription text
    """
    # This is a placeholder for chunking implementation
    # In a production environment, we would split the audio file into chunks
    # and process each chunk separately to manage memory usage
    
    # For now, we'll just process the entire file
    return transcribe_audio(audio_file_path)

# Command-line interface for testing
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_file_path>")
        sys.exit(1)
        
    audio_file_path = sys.argv[1]
    
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found: {audio_file_path}")
        sys.exit(1)
        
    try:
        transcription = process_audio_in_chunks(audio_file_path)
        print(json.dumps({"transcription": transcription}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
