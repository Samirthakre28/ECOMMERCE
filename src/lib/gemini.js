/**
 * Gemini AI Image Generation Utility
 * Uses Google Gemini API to generate product images
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-image';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x800/1a1a1a/e63946?text=REDMONT&font=raleway';

/**
 * Build the optimized prompt for product image generation
 */
function buildImagePrompt(productName, description = '') {
  const descPart = description ? `, ${description}` : '';
  return `Generate a high-quality e-commerce product photograph of "${productName}"${descPart}. 
Requirements: Clean white background, professional studio lighting, realistic product shot, 
high resolution, centered composition, slight shadow underneath, minimalist style, 
suitable for a premium fashion e-commerce website. No text, no watermarks, no people.`;
}

/**
 * Generate a product image using Gemini API
 * Returns a Blob of the generated image
 * 
 * @param {string} productName - Name of the product
 * @param {string} description - Product description for context
 * @param {number} retryCount - Number of retries attempted
 * @returns {Promise<{blob: Blob, mimeType: string} | null>}
 */
export async function generateProductImage(productName, description = '', retryCount = 0) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.warn('Gemini API key not configured');
    return null;
  }

  try {
    const prompt = buildImagePrompt(productName, description);

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          temperature: 0.4,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error ${response.status}: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract image from response
    const candidates = data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates in Gemini response');
    }

    const parts = candidates[0]?.content?.parts;
    if (!parts) {
      throw new Error('No parts in Gemini response');
    }

    // Find the image part (inlineData)
    const imagePart = parts.find(part => part.inlineData);
    if (!imagePart) {
      throw new Error('No image data in Gemini response');
    }

    const { mimeType, data: base64Data } = imagePart.inlineData;

    // Convert base64 to Blob
    const byteString = atob(base64Data);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });

    return { blob, mimeType };

  } catch (error) {
    console.error(`Gemini image generation failed (attempt ${retryCount + 1}):`, error);

    // Retry once
    if (retryCount < 1) {
      console.log('Retrying image generation...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateProductImage(productName, description, retryCount + 1);
    }

    return null;
  }
}

/**
 * Get the placeholder image URL (used when generation fails)
 */
export function getPlaceholderImage() {
  return PLACEHOLDER_IMAGE;
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured() {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here';
}
