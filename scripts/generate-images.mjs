/**
 * REDMONT Product Image Generator
 * Uses Gemini API to generate product images and save them locally
 * 
 * Run: node scripts/generate-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = 'AIzaSyBmPxG1RYPzu6qyDFi2Vf7sTrrpBLS5eRg';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'products');

// All 20 products
const PRODUCTS = [
  { id: 'fb-101', name: "Onyx Essential Tee", category: "Men", desc: "Premium heavyweight cotton tee in deep onyx black, relaxed modern fit" },
  { id: 'fb-102', name: "Crimson Utility Jacket", category: "Men", desc: "Sleek utility jacket with subtle red accents and water-resistant finish" },
  { id: 'fb-103', name: "Silk Wrap Blouse", category: "Women", desc: "Luxurious silk blouse featuring a minimalist wrap design, feminine and elegant" },
  { id: 'fb-104', name: "Midnight Trench", category: "Women", desc: "Classic trench coat in stark midnight black, long and sophisticated" },
  { id: 'fb-105', name: "Miniature Moto Jacket", category: "Kids", desc: "Cute bold faux-leather moto jacket sized for kids and little trendsetters" },
  { id: 'fb-106', name: "Structured Cargo Pants", category: "Men", desc: "Utilitarian cargo pants tailored for a sharp clean look, dark grey" },
  { id: 'fb-107', name: "Cashmere Turtleneck", category: "Women", desc: "Ultra-soft cashmere blend pullover with exaggerated turtleneck in cream white" },
  { id: 'fb-108', name: "Monochrome Sneaker", category: "Men", desc: "Minimalist white leather sneakers with black accent, clean modern design" },
  { id: 'fb-109', name: "Pleated Midi Skirt", category: "Women", desc: "Elegant knife-pleated midi skirt in neutral beige, flowing and premium" },
  { id: 'fb-110', name: "Urban Puffer Vest", category: "Kids", desc: "Lightweight warm puffer vest for kids in navy blue, quilted design" },
  { id: 'fb-111', name: "Textured Knit Polo", category: "Men", desc: "Modern polo shirt with heavy knit texture in charcoal grey" },
  { id: 'fb-112', name: "Sculpted Blazer", category: "Women", desc: "Fitted blazer with strong shoulders and deep V-neckline in black" },
  { id: 'fb-113', name: "Geometric Print Shirt", category: "Men", desc: "Short sleeve button-up shirt with striking geometric black-white pattern" },
  { id: 'fb-114', name: "High-Rise Wide Leg Jeans", category: "Women", desc: "Premium denim jeans in subtle grey wash, wide leg cut for comfort" },
  { id: 'fb-115', name: "Fleece Zip Hoodie", category: "Kids", desc: "Cozy fleece full zip-up hoodie for kids in soft grey" },
  { id: 'fb-116', name: "Matte Black Watch", category: "Men", desc: "Sleek minimalist matte black wristwatch with clean dial, leather strap" },
  { id: 'fb-117', name: "Leather Ankle Boots", category: "Women", desc: "Genuine black leather ankle boots with sharp pointed toe, high heel" },
  { id: 'fb-118', name: "Ribbed Beanie", category: "Kids", desc: "Warm ribbed knit beanie hat for kids in dark charcoal" },
  { id: 'fb-119', name: "Draped Evening Gown", category: "Women", desc: "Effortlessly elegant long evening gown in deep burgundy red, draped silk" },
  { id: 'fb-120', name: "Oversized Wool Coat", category: "Men", desc: "Heavy draped oversized wool coat in dark camel brown, commanding silhouette" },
];

function buildPrompt(name, desc, category) {
  return `Generate a single high-quality e-commerce product photograph of a "${name}" for ${category}'s fashion.
Product details: ${desc}.
CRITICAL REQUIREMENTS:
- Clean pure white background (#FFFFFF)
- Professional studio lighting with soft shadows
- Product centered in frame, shot from slightly above at 3/4 angle
- Photorealistic, high resolution product photography
- The clothing item should be displayed flat-lay or on an invisible mannequin
- For accessories (watch/boots/beanie): show the single item elegantly placed
- No human model, no text, no watermark, no brand logos
- Minimal styling, luxury fashion e-commerce aesthetic
- Sharp focus, vibrant but natural colors`;
}

async function generateImage(product, retryCount = 0) {
  const prompt = buildPrompt(product.name, product.desc, product.category);

  try {
    console.log(`  → Calling Gemini 2.5 Flash Image API...`);
    
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API error ${response.status}: ${errBody.substring(0, 300)}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error('No parts in response');

    const imagePart = parts.find(p => p.inlineData);
    if (!imagePart) throw new Error('No image data in response');

    const { mimeType, data: base64Data } = imagePart.inlineData;
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const buffer = Buffer.from(base64Data, 'base64');

    return { buffer, ext, mimeType };

  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    if (retryCount < 1) {
      console.log(`  ↻ Retrying in 3s...`);
      await sleep(3000);
      return generateImage(product, retryCount + 1);
    }
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   REDMONT — AI Product Image Generator      ║');
  console.log('║   Using Google Gemini 2.0 Flash              ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log();

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    const safeName = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    console.log(`\n[${i + 1}/${PRODUCTS.length}] 🎨 Generating: ${product.name} (${product.category})`);

    // Check if image already exists
    const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith(safeName));
    if (existingFiles.length > 0) {
      console.log(`  ✓ Already exists: ${existingFiles[0]} — skipping`);
      results.push({ id: product.id, name: product.name, file: existingFiles[0], skipped: true });
      successCount++;
      continue;
    }

    const result = await generateImage(product);

    if (result) {
      const fileName = `${safeName}.${result.ext}`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      fs.writeFileSync(filePath, result.buffer);
      const sizeKB = (result.buffer.length / 1024).toFixed(1);
      console.log(`  ✓ Saved: ${fileName} (${sizeKB} KB)`);
      results.push({ id: product.id, name: product.name, file: fileName });
      successCount++;
    } else {
      console.log(`  ✗ FAILED — will use placeholder`);
      results.push({ id: product.id, name: product.name, file: null });
      failCount++;
    }

    // Rate limit: wait 10s between requests
    if (i < PRODUCTS.length - 1) {
      console.log(`  ⏳ Waiting 10s (rate limit)...`);
      await sleep(10000);
    }
  }

  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 RESULTS: ${successCount} generated, ${failCount} failed\n`);

  // Generate the updated FALLBACK_PRODUCTS array
  console.log('📋 Updated image paths for ProductGrid.jsx:\n');
  for (const r of results) {
    if (r.file) {
      console.log(`  ${r.id} "${r.name}" → "/products/${r.file}"`);
    } else {
      console.log(`  ${r.id} "${r.name}" → PLACEHOLDER`);
    }
  }

  // Also write a JSON mapping file
  const mappingPath = path.join(OUTPUT_DIR, '_image-map.json');
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Image mapping saved to: ${mappingPath}`);
  console.log('\nDone! Now run the update script or manually update ProductGrid.jsx');
}

main().catch(console.error);
