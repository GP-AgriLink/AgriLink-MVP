/**
 * AI Service for AI Flash Lite Integration (Server-Side)
 * Uses Google's AI API via REST
 * SECURITY: API key is stored securely on server-side
 */

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL_ID = process.env.AI_MODEL_ID || 'gemini-2.5-flash';
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
const AI_API_URL = `${AI_API_BASE_URL}/${AI_MODEL_ID}:generateContent`;
const AI_FILES_UPLOAD_URL = process.env.AI_FILES_UPLOAD_URL || 'https://generativelanguage.googleapis.com/upload/v1beta/files';
const AI_FILES_BASE_URL = process.env.AI_FILES_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/files';

// OpenStreetMap Nominatim API for reverse geocoding (free, no key needed)
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * List all uploaded files from AI File API
 * @returns {Promise<Array<{name: string, uri: string, mimeType: string, displayName: string}>>}
 */
export const listAIFiles = async () => {
  if (!AI_API_KEY || AI_API_KEY === 'your_api_key_here') {
    return [];
  }

  try {
    const response = await fetch(AI_FILES_BASE_URL, {
      method: 'GET',
      headers: {
        'x-goog-api-key': AI_API_KEY,
      },
    });

    if (!response.ok) {
      console.warn(`[AI] List files failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('[AI] List files error:', error);
    return [];
  }
};

/**
 * Upload an image from URL to AI File API
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} displayName - Display name for the file (e.g., product ID)
 * @returns {Promise<{uri: string, mimeType: string, name: string} | null>}
 */
export const uploadImageToAI = async (imageUrl, displayName = 'product-image') => {
  if (!imageUrl) return null;
  if (!AI_API_KEY || AI_API_KEY === 'your_api_key_here') {
    throw new Error('AI API key is not configured');
  }

  try {

    // Step 1: Fetch the image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.buffer();
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const numBytes = imageBuffer.length;


    // Step 2: Start resumable upload session
    const startResponse = await fetch(AI_FILES_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': AI_API_KEY,
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: {
          display_name: displayName,
        },
      }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `Upload start failed: ${startResponse.status}`
      );
    }

    // Get upload URL from response headers
    const uploadUrl = startResponse.headers.get('x-goog-upload-url');
    if (!uploadUrl) {
      throw new Error('No upload URL received from AI');
    }


    // Step 3: Upload the actual file bytes
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': numBytes.toString(),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Upload failed: ${uploadResponse.status}`
      );
    }

    const fileInfo = await uploadResponse.json();
    const fileUri = fileInfo.file?.uri;
    const fileName = fileInfo.file?.name;

    if (!fileUri || !fileName) {
      throw new Error('File upload succeeded but no URI/name returned');
    }


    return {
      uri: fileUri,
      mimeType: fileInfo.file.mimeType || mimeType,
      name: fileName,
      displayName: fileInfo.file.displayName || displayName,
    };
  } catch (error) {
    console.error('[AI] File upload error:', error);
    return null; // Return null on error - caller should handle this
  }
};

/**
 * Upload a text file (e.g., markdown) to AI File API
 * @param {string} textContent - The text content to upload
 * @param {string} displayName - Display name for the file
 * @param {string} mimeType - MIME type of the content (default: text/plain)
 * @returns {Promise<{uri: string, mimeType: string, name: string, displayName: string} | null>}
 */
export const uploadTextFile = async (textContent, displayName = 'text-file', mimeType = 'text/plain') => {
  if (!textContent) return null;
  if (!AI_API_KEY || AI_API_KEY === 'your_api_key_here') {
    throw new Error('AI API key is not configured');
  }

  try {
    const textBuffer = Buffer.from(textContent, 'utf-8');
    const numBytes = textBuffer.length;

    // Step 1: Start resumable upload session
    const startResponse = await fetch(AI_FILES_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': AI_API_KEY,
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: {
          display_name: displayName,
        },
      }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `Upload start failed: ${startResponse.status}`
      );
    }

    const uploadUrl = startResponse.headers.get('x-goog-upload-url');
    if (!uploadUrl) {
      throw new Error('No upload URL received from AI');
    }

    // Step 2: Upload the actual text content
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': numBytes.toString(),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      body: textBuffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Upload failed: ${uploadResponse.status}`
      );
    }

    const fileInfo = await uploadResponse.json();
    const fileUri = fileInfo.file?.uri;
    const fileName = fileInfo.file?.name;

    if (!fileUri || !fileName) {
      throw new Error('File upload succeeded but no URI/name returned');
    }

    return {
      uri: fileUri,
      mimeType: fileInfo.file.mimeType || mimeType,
      name: fileName,
      displayName: fileInfo.file.displayName || displayName,
    };
  } catch (error) {
    console.error('[AI] Text file upload error:', error);
    return null;
  }
};


/**
 * Delete a file from AI File API
 * @param {string} fileName - Name of the file to delete (e.g., 'files/abc123')
 * @returns {Promise<boolean>}
 */
export const deleteAIFile = async (fileName) => {
  if (!fileName) return false;
  if (!AI_API_KEY || AI_API_KEY === 'your_api_key_here') {
    return false;
  }

  try {

    const response = await fetch(`${AI_FILES_BASE_URL}/${fileName}`, {
      method: 'DELETE',
      headers: {
        'x-goog-api-key': AI_API_KEY,
      },
    });

    if (!response.ok) {
      console.warn(`[AI] File deletion failed: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[AI] File deletion error:', error);
    return false;
  }
};

/**
 * Get or upload product image to AI File API
 * Checks if file with productId display name already exists, reuses if found
 * @param {string} imageUrl - URL of the image
 * @param {string} productId - Product ID to use as display name
 * @returns {Promise<{uri: string, mimeType: string, name: string, displayName: string} | null>}
 */
export const getOrUploadImage = async (imageUrl, productId) => {
  if (!imageUrl || !productId) return null;

  try {
    // Check if file already exists with this product ID
    const files = await listAIFiles();
    const existingFile = files.find((f) => f.displayName === productId);

    if (existingFile) {
      return {
        uri: existingFile.uri,
        mimeType: existingFile.mimeType,
        name: existingFile.name,
        displayName: existingFile.displayName,
      };
    }

    // File doesn't exist, upload it
    return await uploadImageToAI(imageUrl, productId);
  } catch (error) {
    console.error('[AI] Get or upload error:', error);
    return null;
  }
};

/**
 * Make a request to AI API with file upload support
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens for the response
 * @param {object|null} fileData - Optional uploaded file data {uri, mimeType, name}
 * @returns {Promise<string>} - Generated content
 */
const callAI = async (prompt, maxTokens = 150, fileData = null) => {
  if (!AI_API_KEY || AI_API_KEY === 'your_api_key_here') {
    throw new Error(
      'AI API key is not configured. Please add AI_API_KEY to your .env file.'
    );
  }

  try {
    // Build parts array for multimodal support
    const parts = [];

    // Add image from file URI if available
    if (fileData && fileData.uri) {
      parts.push({
        file_data: {
          mime_type: fileData.mimeType,
          file_uri: fileData.uri,
        },
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': AI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts,
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed: ${response.status}`
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    return generatedText.trim();
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};

/**
 * Get location details from coordinates using OpenStreetMap
 * @param {number[]} coordinates - [longitude, latitude]
 * @returns {Promise<object>} - Location details
 */
const getLocationDetails = async (coordinates) => {
  if (!coordinates || coordinates.length !== 2) {
    return null;
  }

  const [lng, lat] = coordinates;

  try {
    const response = await fetch(
      `${NOMINATIM_API_URL}?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AgriLink-MVP/1.0',
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to fetch location details from OpenStreetMap');
      return null;
    }

    const data = await response.json();
    return {
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        'Unknown',
      region: data.address?.state || data.address?.region || '',
      country: data.address?.country || '',
    };
  } catch (error) {
    console.error('Location lookup error:', error);
    return null;
  }
};

/**
 * Generate product description based on product name and optional image
 * @param {string} productName - Name of the product
 * @param {string} imageUrl - Optional image URL
 * @param {string} existingDescription - Optional existing description for context
 * @param {object|null} fileData - Optional uploaded file data {uri, mimeType, name}
 * @returns {Promise<string>} - Generated description
 */
export const generateProductDescription = async (
  productName,
  imageUrl = '',
  existingDescription = '',
  fileData = null
) => {
  if (!productName || !productName.trim()) {
    throw new Error('Product name is required');
  }

  // Build dynamic context
  const contextParts = [`Product: ${productName}`];
  
  if (fileData) {
    contextParts.push('Visual Context: Analyze the image to enhance your description with specific details about appearance, quality, and freshness.');
  }

  const context = contextParts.join('\n');

  // Single optimized prompt template
  const prompt = `You are an expert agricultural product copywriter. Create a compelling, concise product description.

${context}

Requirements:
- Write EXACTLY 1-2 clear, descriptive sentences
- Highlight key features: quality, freshness, taste, or unique characteristics
- Use vivid, appetizing language that makes customers want to buy
- Be professional yet engaging
- Focus on benefits and sensory appeal

Return ONLY the description text, no labels or titles.`;

  return await callAI(prompt, 100, fileData);
};

/**
 * Standardize product category to ensure consistency with visual analysis
 * @param {string} productName - Name of the product
 * @param {string} imageUrl - Optional image URL for visual analysis
 * @param {string} existingCategory - Optional existing category for context
 * @param {object|null} fileData - Optional uploaded file data {uri, mimeType, name}
 * @returns {Promise<string>} - Standardized category
 */
// Valid product categories (constant)
const VALID_CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy', 'Organic'];

export const standardizeCategory = async (
  productName,
  imageUrl = '',
  existingCategory = '',
  fileData = null
) => {
  if (!productName || !productName.trim()) {
    throw new Error('Product name is required');
  }

  // Build dynamic context
  const contextParts = [`Product Name: ${productName}`];
  
  if (existingCategory) {
    contextParts.push(`Current Category: ${existingCategory}`);
  }
  
  if (fileData) {
    contextParts.push('Visual Context: Analyze the provided image to accurately identify the product category based on visual features.');
  }

  const context = contextParts.join('\n');

  // Determine primary rule based on available data
  const primaryRule = fileData
    ? 'PRIORITIZE visual analysis - the image is the most reliable source for categorization'
    : 'Use the product name primarily';

  // Single optimized prompt template
  const prompt = `You are a product categorization system. Your task is to assign products to ONE standardized category.

CRITICAL: You MUST return EXACTLY ONE of these category names (case-sensitive):
${VALID_CATEGORIES.map(cat => `- ${cat}`).join('\n')}

${context}

Rules:
1. ${primaryRule}
2. Return ONLY the category name, nothing else
3. Use the EXACT spelling and capitalization shown above
4. Be consistent - the same product should ALWAYS get the same category
5. 'Organic' should ONLY be used if explicitly stated or clearly visible organic certification in the image

Return ONLY the category name:`;

  const category = await callAI(prompt, 50, fileData);

  // Validate and clean the response
  const trimmedCategory = category.trim();

  // Find exact match or case-insensitive match
  const matchedCategory = VALID_CATEGORIES.find(
    (valid) => valid.toLowerCase() === trimmedCategory.toLowerCase()
  );

  return matchedCategory || 'Vegetables'; // Default to Vegetables if invalid
};

/**
 * Generate or polish farm bio based on farm details
 * @param {string} farmName - Name of the farm
 * @param {string} locationName - Location name (e.g., "Cairo, Egypt")
 * @param {string[]} specialties - Array of farm specialties
 * @param {string} existingBio - Optional existing bio to polish
 * @returns {Promise<string>} - Generated or polished bio
 */
export const generateFarmBio = async (
  farmName,
  locationName,
  specialties = [],
  existingBio = ''
) => {
  if (!farmName || !farmName.trim()) {
    throw new Error('Farm name is required');
  }

  const hasLocation = !!locationName;
  const hasSpecialties = specialties && specialties.length > 0;
  const hasExistingBio = existingBio && existingBio.trim();

  // Build dynamic context based on available data
  const contextParts = [`Farm Name: ${farmName}`];
  
  if (hasLocation) {
    contextParts.push(`Location: ${locationName}`);
  }
  
  if (hasSpecialties) {
    contextParts.push(`Specialties: ${specialties.join(', ')}`);
  }
  
  if (hasExistingBio) {
    contextParts.push(`\nCurrent Bio:\n${existingBio}`);
  }

  const context = contextParts.join('\n');

  // Determine the task type
  const taskType = hasExistingBio ? 'polish' : 'generate';
  const taskInstruction = hasExistingBio
    ? 'Polish and enhance the current bio while keeping its core message and authenticity.'
    : 'Create a compelling farm bio that introduces the farm to customers.';

  // Build guidance based on available data
  const guidanceParts = [];
  
  if (hasLocation) {
    guidanceParts.push('Naturally incorporate the location as a strength');
  }
  
  if (hasSpecialties) {
    guidanceParts.push('Highlight the specialties as signature offerings');
  }
  
  if (!hasLocation && !hasSpecialties) {
    guidanceParts.push('Emphasize farming values, quality commitment, and community connection');
  }

  const guidance = guidanceParts.length > 0 
    ? `\nFocus:\n- ${guidanceParts.join('\n- ')}`
    : '';

  // Single optimized prompt template
  const prompt = `You are an expert agricultural content writer. ${taskInstruction}

${context}

Requirements:
- CRITICAL: Write EXACTLY 1-4 clear short, professional, amazing sentences (max 75 words total)
- Create an inspiring, authentic narrative that stands out
- Use compelling, vivid language that builds trust and connection
- Be authentic, memorable, and professional
- Emphasize: quality, freshness, sustainability, community, passion${guidance}

Return ONLY the bio text (1-4 sentences), no titles or labels.`;

  return await callAI(prompt, 100);
};

/**
 * Check if AI service is properly configured
 * @returns {boolean} - True if API key is configured
 */
export const isAIConfigured = () => {
  return !!AI_API_KEY && AI_API_KEY !== 'your_api_key_here';
};
