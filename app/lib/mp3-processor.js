// MP3 extraction and upload implementation
// This file contains the core logic for YouTube download, MP3 conversion, and Supabase upload

import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, unlink } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { supabase } from '@/app/lib/supabase-client';
import { pipeline } from 'stream';
import { v4 as uuidv4 } from 'uuid';

const pipelineAsync = promisify(pipeline);
const unlinkAsync = promisify(unlink);
const tempDir = '/tmp';

/**
 * Process YouTube URL to MP3 and upload to Supabase
 * @param {string} id - Conversion record ID
 * @returns {Promise<void>}
 */
export async function processMP3Conversion(id) {
  // Get the conversion record
  const { data: conversion, error } = await supabase
    .from('conversions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !conversion) {
    throw new Error('Conversion record not found');
  }
  
  try {
    // Update status to converting_mp3
    await updateConversionStatus(id, 'converting_mp3');
    
    // Get video info to extract title
    const videoInfo = await ytdl.getInfo(conversion.youtube_url);
    const videoTitle = videoInfo.videoDetails.title.substring(0, 50); // Limit title length
    const sanitizedTitle = videoTitle.replace(/[^\w\s-]/g, ''); // Sanitize title
    
    // Generate unique filename
    const fileName = `${sanitizedTitle}-${uuidv4().substring(0, 8)}.mp3`;
    const tempFilePath = join(tempDir, fileName);
    
    // Download and convert to MP3 using streaming approach
    await downloadAndConvertToMP3(conversion.youtube_url, tempFilePath);
    
    // Upload to Supabase Storage
    const filePath = `${id}/${fileName}`;
    await uploadToSupabase(tempFilePath, filePath);
    
    // Update conversion record with success
    await supabase
      .from('conversions')
      .update({
        status: 'completed',
        title: sanitizedTitle,
        mp3_file_path: filePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    // Clean up temp file
    await unlinkAsync(tempFilePath);
    
  } catch (error) {
    console.error(`Error processing MP3 conversion for ${id}:`, error);
    
    // Update conversion record with error
    await supabase
      .from('conversions')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown error occurred during MP3 conversion',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    throw error;
  }
}

/**
 * Download YouTube audio and convert to MP3
 * @param {string} url - YouTube URL
 * @param {string} outputPath - Path to save MP3 file
 * @returns {Promise<void>}
 */
async function downloadAndConvertToMP3(url, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // Get audio-only stream with highest quality
      const audioStream = ytdl(url, {
        quality: 'highestaudio',
        filter: 'audioonly'
      });
      
      // Use ffmpeg to convert to MP3
      const ffmpegProcess = ffmpeg(audioStream)
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('end', () => {
          resolve();
        });
        
      // Write to output file
      const outputStream = createWriteStream(outputPath);
      ffmpegProcess.pipe(outputStream);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Upload file to Supabase Storage
 * @param {string} filePath - Local file path
 * @param {string} storagePath - Path in Supabase Storage
 * @returns {Promise<void>}
 */
async function uploadToSupabase(filePath, storagePath) {
  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(storagePath, filePath, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }
  
  return data;
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
