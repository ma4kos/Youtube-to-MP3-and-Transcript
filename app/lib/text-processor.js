// Text processor module for handling MP3 to text conversion
// This integrates with the Python transcription script

import { supabase } from '@/app/lib/supabase-client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdtempAsync = promisify(fs.mkdtemp);

/**
 * Process text conversion for a conversion record
 * @param {string} id - Conversion record ID
 * @returns {Promise<void>}
 */
export async function processTextConversion(id) {
  // Get the conversion record
  const { data: conversion, error } = await supabase
    .from('conversions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !conversion) {
    throw new Error('Conversion record not found');
  }
  
  // Check if MP3 exists
  if (!conversion.mp3_file_path) {
    throw new Error('MP3 file not found for this conversion');
  }
  
  try {
    // Update status to converting_text
    await updateConversionStatus(id, 'converting_text');
    
    // Download MP3 from Supabase Storage
    const tempDir = await mkdtempAsync(join(os.tmpdir(), 'transcribe-'));
    const tempFilePath = join(tempDir, path.basename(conversion.mp3_file_path));
    
    await downloadFromSupabase(conversion.mp3_file_path, tempFilePath);
    
    // Call Python script for transcription
    const transcript = await transcribeAudio(tempFilePath);
    
    // Update conversion record with transcript
    await supabase
      .from('conversions')
      .update({
        status: 'completed',
        transcript,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    // Clean up temp files
    await unlinkAsync(tempFilePath);
    fs.rmdir(tempDir, (err) => {
      if (err) console.error(`Error removing temp directory: ${err}`);
    });
    
  } catch (error) {
    console.error(`Error processing text conversion for ${id}:`, error);
    
    // Update conversion record with error
    await supabase
      .from('conversions')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown error occurred during text conversion',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    throw error;
  }
}

/**
 * Download file from Supabase Storage
 * @param {string} storagePath - Path in Supabase Storage
 * @param {string} outputPath - Local path to save file
 * @returns {Promise<void>}
 */
async function downloadFromSupabase(storagePath, outputPath) {
  const { data, error } = await supabase.storage
    .from('audio-files')
    .download(storagePath);
    
  if (error) {
    throw new Error(`Failed to download from Supabase: ${error.message}`);
  }
  
  // Convert blob to buffer and write to file
  const buffer = Buffer.from(await data.arrayBuffer());
  await writeFileAsync(outputPath, buffer);
  
  return outputPath;
}

/**
 * Transcribe audio using Python script
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<string>}
 */
async function transcribeAudio(audioPath) {
  try {
    // Set environment variable for Python script
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key';
    
    // Call Python script
    const scriptPath = join(process.cwd(), 'transcribe.py');
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath} "${audioPath}"`);
    
    if (stderr) {
      console.error('Transcription stderr:', stderr);
    }
    
    // Parse JSON output from Python script
    try {
      const result = JSON.parse(stdout);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.transcription || 'Transcription failed';
    } catch (parseError) {
      console.error('Error parsing transcription output:', parseError);
      return stdout.trim() || 'Transcription failed';
    }
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Update conversion status
 * @param {string} id - Conversion record ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
async function updateConversionStatus(id, status) {
  const { error } = await supabase
    .from('conversions')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  if (error) {
    console.error(`Error updating conversion status for ${id}:`, error);
  }
}
