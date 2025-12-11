/**
 * AI Service for Gemini Flash Lite Integration
 * Uses Google's Gemini API via REST (no additional packages)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

// OpenStreetMap Nominatim API for reverse geocoding (free, no key needed)
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Fetch image from URL and convert to base64
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<{base64: string, mimeType: string} | null>}
 */
const fetchImageAsBase64 = async (imageUrl) => {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    const mimeType = blob.type || "image/jpeg";

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

/**
 * Make a request to Gemini API with optional image support
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens to generate
 * @param {object|null} imageData - Optional image data {base64, mimeType}
 * @returns {Promise<string>} - Generated text
 */
const callGeminiAPI = async (prompt, maxTokens = 500, imageData = null) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_api_key_here") {
    throw new Error(
      "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  try {
    // Build parts array for multimodal support
    const parts = [];

    // Add image first (higher priority for AI analysis)
    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.base64,
        },
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
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
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No content generated from AI");
    }

    return generatedText.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
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
          "User-Agent": "AgriLink-MVP/1.0",
        },
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch location details from OpenStreetMap");
      return null;
    }

    const data = await response.json();
    return {
      city: data.address?.city || data.address?.town || data.address?.village || "Unknown",
      region: data.address?.state || data.address?.region || "",
      country: data.address?.country || "",
    };
  } catch (error) {
    console.error("Location lookup error:", error);
    return null;
  }
};

/**
 * Generate product description based on product name and optional image
 * @param {string} productName - Name of the product
 * @param {string} imageUrl - Optional image URL
 * @param {string} existingDescription - Optional existing description for context
 * @returns {Promise<string>} - Generated description
 */
export const generateProductDescription = async (
  productName,
  imageUrl = "",
  existingDescription = ""
) => {
  if (!productName || !productName.trim()) {
    throw new Error("Product name is required");
  }

  // Fetch and convert image to base64 for visual analysis
  const imageData = imageUrl ? await fetchImageAsBase64(imageUrl) : null;

  const prompt = `Create a short product description (1-2 sentences max).

Product: ${productName}
${imageData ? "Describe what you see in the image." : ""}

Make it professional, highlight quality and freshness. Be concise and natural.`;

  return await callGeminiAPI(prompt, 80, imageData);
};

/**
 * Standardize product category to ensure consistency with visual analysis
 * @param {string} productName - Name of the product
 * @param {string} imageUrl - Optional image URL for visual analysis
 * @param {string} existingCategory - Optional existing category for context
 * @returns {Promise<string>} - Standardized category
 */
export const standardizeCategory = async (productName, imageUrl = "", existingCategory = "") => {
  if (!productName || !productName.trim()) {
    throw new Error("Product name is required");
  }

  // Fetch and convert image to base64 for visual analysis
  const imageData = imageUrl ? await fetchImageAsBase64(imageUrl) : null;

  const prompt = `You are a product categorization system. Your task is to assign products to ONE standardized category.

CRITICAL: You MUST return EXACTLY ONE of these category names (case-sensitive):
- Vegetables
- Fruits
- Grains
- Herbs
- Dairy
- Organic

Product Name: ${productName}
${existingCategory ? `Current Category: ${existingCategory}` : ""}
${imageData ? "Visual Context: Analyze the provided image to accurately identify the product category based on visual features." : ""}

Rules:
1. ${imageData ? "PRIORITIZE visual analysis - the image is the most reliable source for categorization" : "Use the product name primarily"}
2. Return ONLY the category name, nothing else
3. Use the EXACT spelling and capitalization shown above
4. Be consistent - the same product should ALWAYS get the same category
5. "Organic" should ONLY be used if explicitly stated or clearly visible organic certification in the image

Return ONLY the category name:`;

  const category = await callGeminiAPI(prompt, 50, imageData);

  // Validate and clean the response
  const validCategories = ["Vegetables", "Fruits", "Grains", "Herbs", "Dairy", "Organic"];
  const trimmedCategory = category.trim();

  // Find exact match or case-insensitive match
  const matchedCategory = validCategories.find(
    (valid) => valid.toLowerCase() === trimmedCategory.toLowerCase()
  );

  return matchedCategory || "Vegetables"; // Default to Vegetables if invalid
};

/**
 * Generate or polish farm bio based on farm details
 * @param {string} farmName - Name of the farm
 * @param {number[]} coordinates - [longitude, latitude]
 * @param {string[]} specialties - Array of farm specialties
 * @param {string} existingBio - Optional existing bio to polish
 * @returns {Promise<string>} - Generated or polished bio
 */
export const generateFarmBio = async (
  farmName,
  coordinates,
  specialties = [],
  existingBio = ""
) => {
  if (!farmName || !farmName.trim()) {
    throw new Error("Farm name is required");
  }

  // Get location details
  const location = coordinates ? await getLocationDetails(coordinates) : null;
  const hasLocation = !!location;
  const hasSpecialties = specialties && specialties.length > 0;
  const hasExistingBio = existingBio && existingBio.trim();

  // Check if this is a brand new farm with minimal data
  const isNewFarm = !hasExistingBio && !hasLocation && !hasSpecialties;

  const locationInfo = location
    ? `Located in ${location.city}${location.region ? `, ${location.region}` : ""}${location.country ? `, ${location.country}` : ""}`
    : "";

  const specialtiesInfo = hasSpecialties ? `Farm specialties: ${specialties.join(", ")}` : "";

  let prompt;

  if (hasExistingBio) {
    // Polish existing bio
    prompt = `You are an agricultural content writer. Polish and enhance this farm bio while keeping its core message.

Farm Name: ${farmName}
${locationInfo}
${specialtiesInfo}

Current Bio:
${existingBio}

Task:
- Enhance the bio while keeping it authentic and professional
- Maintain the core message and personality
- Fix any grammar or clarity issues
- Write a detailed, engaging bio (5-7 sentences, 250-400 words)
- Incorporate location and specialties naturally if they're missing
- Make it warm and inviting
- Tell a compelling story about the farm

Return ONLY the polished bio text:`;
  } else if (isNewFarm) {
    // Generate a helpful starter bio for brand new farms
    prompt = `You are an agricultural content writer. Create a welcoming starter bio for a new farm profile.

Farm Name: ${farmName}

Task:
- Write a professional, friendly starter bio (4-5 sentences, 150-250 words)
- Create a warm welcome message that introduces the farm
- Emphasize commitment to quality, freshness, and sustainability
- Include generic but authentic statements about farm-to-table values
- Make it easy for the farmer to personalize later by adding placeholders for specific details
- Use an inviting, community-focused tone
- Keep it genuine and professional, not overly promotional

Example structure:
- Welcome introduction
- Commitment to quality and sustainable practices
- Connection to community and customers
- Invitation to explore products

Return ONLY the bio text:`;
  } else {
    // Generate new bio with available data
    const contextInfo = [];
    if (locationInfo) contextInfo.push(locationInfo);
    if (specialtiesInfo) contextInfo.push(specialtiesInfo);

    const availableContext =
      contextInfo.length > 0
        ? contextInfo.join("\n")
        : "Limited information available - generate a welcoming, general farm bio";

    prompt = `You are an agricultural content writer. Create a compelling farm bio that tells the farm's story.

Farm Name: ${farmName}
${availableContext}

Requirements:
- Write a warm, authentic bio (5-7 sentences, 250-400 words)
- Highlight what makes this farm special and its unique story
- ${locationInfo ? "Incorporate the location naturally" : "Focus on farming values and quality"}
- ${hasSpecialties ? "Emphasize the farm specialties" : "Discuss diverse agricultural offerings"}
- Use a friendly, professional tone
- Focus on quality, freshness, sustainability, and community
- Make customers feel connected to the farm
- Include details about farming practices, products, or the farm's values
- Create an engaging narrative that draws readers in

Return ONLY the bio text, no titles or labels:`;
  }

  return await callGeminiAPI(prompt, 600);
};

/**
 * Check if AI service is properly configured
 * @returns {boolean} - True if API key is configured
 */
export const isAIConfigured = () => {
  return !!GEMINI_API_KEY && GEMINI_API_KEY !== "your_api_key_here";
};
