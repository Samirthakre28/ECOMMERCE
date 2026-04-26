/**
 * Supabase Storage Utility
 * Handles image upload to Supabase Storage "products" bucket
 */

import { supabase } from './supabaseClient';

const BUCKET_NAME = 'products';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x800/1a1a1a/e63946?text=REDMONT&font=raleway';

/**
 * Upload an image blob to Supabase Storage
 * 
 * @param {Blob} blob - Image blob to upload
 * @param {string} mimeType - MIME type (e.g., 'image/png')
 * @param {string} productName - Used for generating readable filename
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadProductImage(blob, mimeType, productName = 'product') {
  try {
    // Generate unique filename
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const safeName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40);
    const timestamp = Date.now();
    const fileName = `${safeName}-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return urlData.publicUrl;

  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * 
 * @param {string} imageUrl - Full public URL of the image
 */
export async function deleteProductImage(imageUrl) {
  try {
    if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) return;

    // Extract file path from URL
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[urlParts.length - 1];
    
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
  } catch (error) {
    console.error('Image delete error:', error);
  }
}

/**
 * Get placeholder image URL
 */
export function getPlaceholderUrl() {
  return PLACEHOLDER_IMAGE;
}

/**
 * Validate if an image URL is accessible
 */
export async function isImageValid(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}
