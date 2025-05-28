// API route for converting MP3 to text using Gemini API
// This handles the text conversion request

import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase-client';
import { processTextConversion } from '@/app/lib/text-processor';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Conversion ID is required' },
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
    
    // Check if MP3 exists
    if (!conversion.mp3_file_path) {
      return NextResponse.json(
        { error: 'MP3 file not found for this conversion' },
        { status: 400 }
      );
    }
    
    // Update status to converting_text
    await supabase
      .from('conversions')
      .update({
        status: 'converting_text',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    // Process text conversion in the background
    // This is done asynchronously to avoid blocking the API response
    processTextConversion(id).catch(error => {
      console.error(`Error in text conversion for ${id}:`, error);
    });
    
    return NextResponse.json({ 
      message: 'Text conversion started',
      id
    });
    
  } catch (error) {
    console.error('Error in convert-to-text API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
