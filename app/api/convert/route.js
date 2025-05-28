// API route for converting YouTube URLs to MP3
// This handles the initial conversion request and queues processing

import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { urls, sessionId, conversionType } = await request.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      );
    }
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Create conversion records in Supabase
    const conversions = [];
    
    for (const url of urls) {
      // Create a pending record for each URL
      const { data, error } = await supabase
        .from('conversions')
        .insert({
          session_id: sessionId,
          youtube_url: url,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error creating conversion record:', error);
        continue;
      }
      
      if (data && data.length > 0) {
        conversions.push(data[0]);
      }
    }
    
    // Queue processing for each conversion
    // In a production environment, this would use a proper job queue
    // For this implementation, we'll process sequentially to manage resources
    
    // Start processing in the background
    processConversions(conversions, conversionType);
    
    return NextResponse.json({ 
      message: 'Conversion started',
      count: conversions.length
    });
    
  } catch (error) {
    console.error('Error in convert API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process conversions sequentially to manage resources
async function processConversions(conversions, conversionType) {
  for (const conversion of conversions) {
    try {
      // Process MP3 conversion
      await processMP3Conversion(conversion.id);
      
      // If requested, also process text conversion
      if (conversionType === 'mp3_text') {
        await processTextConversion(conversion.id);
      }
    } catch (error) {
      console.error(`Error processing conversion ${conversion.id}:`, error);
      
      // Update status to failed
      await supabase
        .from('conversions')
        .update({
          status: 'failed',
          error_message: error.message || 'Unknown error occurred',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversion.id);
    }
  }
}

// Process MP3 conversion for a single record
async function processMP3Conversion(id) {
  // This function will be implemented in a separate file
  // and imported here. For now, we'll just update the status
  // to simulate processing.
  
  // Update status to converting_mp3
  await supabase
    .from('conversions')
    .update({
      status: 'converting_mp3',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  // In the actual implementation, this would:
  // 1. Download the YouTube audio using ytdl-core
  // 2. Convert to MP3 using fluent-ffmpeg
  // 3. Upload to Supabase storage
  // 4. Update the record with the file path and status
  
  // For now, we'll just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update status to completed with a placeholder file path
  await supabase
    .from('conversions')
    .update({
      status: 'completed',
      mp3_file_path: `${id}.mp3`,
      title: 'Sample YouTube Video',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
}

// Process text conversion for a single record
async function processTextConversion(id) {
  // This function will be implemented in a separate file
  // For now, we'll just update the status to simulate processing
  
  // Get the conversion record
  const { data, error } = await supabase
    .from('conversions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !data) {
    throw new Error('Conversion record not found');
  }
  
  // Update status to converting_text
  await supabase
    .from('conversions')
    .update({
      status: 'converting_text',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  // In the actual implementation, this would:
  // 1. Get the MP3 file from Supabase storage
  // 2. Use Gemini API to transcribe the audio
  // 3. Update the record with the transcript
  
  // For now, we'll just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update with a placeholder transcript
  await supabase
    .from('conversions')
    .update({
      status: 'completed',
      transcript: 'This is a sample transcript for the YouTube video.',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
}
