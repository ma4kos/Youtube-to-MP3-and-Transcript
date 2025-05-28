// API route for downloading MP3 or text files
// This handles file downloads with proper content types and security

import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase-client';

export async function GET(request, { params }) {
  try {
    const { id, type } = params;
    
    if (!id || !type) {
      return NextResponse.json(
        { error: 'Conversion ID and type are required' },
        { status: 400 }
      );
    }
    
    // Get the conversion record
    const { data: conversion, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !conversion) {
      return NextResponse.json(
        { error: 'Conversion record not found' },
        { status: 404 }
      );
    }
    
    // Handle MP3 download
    if (type === 'mp3') {
      if (!conversion.mp3_file_path) {
        return NextResponse.json(
          { error: 'MP3 file not found for this conversion' },
          { status: 404 }
        );
      }
      
      // Generate signed URL for MP3 download
      const { data, error: signedUrlError } = await supabase.storage
        .from('audio-files')
        .createSignedUrl(conversion.mp3_file_path, 60 * 60); // 1 hour expiry
        
      if (signedUrlError) {
        return NextResponse.json(
          { error: 'Failed to generate download link' },
          { status: 500 }
        );
      }
      
      // Redirect to signed URL
      return NextResponse.redirect(data.signedUrl);
    }
    
    // Handle text download
    if (type === 'text') {
      if (!conversion.transcript) {
        return NextResponse.json(
          { error: 'Transcript not found for this conversion' },
          { status: 404 }
        );
      }
      
      // Generate filename from title or ID
      const fileName = `${conversion.title || 'transcript'}-${id.substring(0, 8)}.txt`;
      
      // Return transcript as downloadable text file
      return new NextResponse(conversion.transcript, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }
    
    // Invalid type
    return NextResponse.json(
      { error: 'Invalid download type. Use "mp3" or "text".' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
