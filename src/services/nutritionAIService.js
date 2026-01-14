/**
 * FatToFit Nutrition AI Service
 * Handles barcode scanning and photo-to-macro estimation
 */

import { OPENAI_CONFIG } from '../utils/constants';

// Nutritionix API (free tier available)
const NUTRITIONIX_APP_ID = 'your-app-id'; // Replace with your Nutritionix app ID
const NUTRITIONIX_API_KEY = 'your-api-key'; // Replace with your Nutritionix API key

class NutritionAIService {
  /**
   * Look up food by barcode using Nutritionix API
   */
  async lookupBarcode(barcode) {
    try {
      const response = await fetch(
        `https://trackapi.nutritionix.com/v2/search/item?upc=${barcode}`,
        {
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Product not found' };
        }
        throw new Error('Failed to lookup barcode');
      }

      const data = await response.json();
      const food = data.foods?.[0];

      if (!food) {
        return { success: false, error: 'Product not found' };
      }

      return {
        success: true,
        data: {
          meal_name: food.food_name || food.brand_name_item_name,
          brand: food.brand_name,
          calories: Math.round(food.nf_calories || 0),
          protein_g: Math.round(food.nf_protein || 0),
          carbs_g: Math.round(food.nf_total_carbohydrate || 0),
          fat_g: Math.round(food.nf_total_fat || 0),
          fiber_g: Math.round(food.nf_dietary_fiber || 0),
          sugar_g: Math.round(food.nf_sugars || 0),
          serving_size: food.serving_qty 
            ? `${food.serving_qty} ${food.serving_unit}` 
            : food.serving_size_formatted,
          photo_url: food.photo?.thumb,
          barcode,
          source: 'barcode',
        },
      };
    } catch (error) {
      console.error('Barcode lookup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search for food by name using Nutritionix
   */
  async searchFood(query) {
    try {
      const response = await fetch(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search food');
      }

      const data = await response.json();

      return {
        success: true,
        data: (data.foods || []).map((food) => ({
          meal_name: food.food_name,
          calories: Math.round(food.nf_calories || 0),
          protein_g: Math.round(food.nf_protein || 0),
          carbs_g: Math.round(food.nf_total_carbohydrate || 0),
          fat_g: Math.round(food.nf_total_fat || 0),
          serving_size: `${food.serving_qty} ${food.serving_unit}`,
          photo_url: food.photo?.thumb,
          source: 'search',
        })),
      };
    } catch (error) {
      console.error('Food search error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Estimate macros from a meal photo using GPT-4 Vision
   */
  async estimateFromPhoto(base64Image, apiKey) {
    if (!apiKey) {
      return { success: false, error: 'OpenAI API key required' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert AI. Analyze food images and estimate nutritional information.
              
Your response MUST be valid JSON with this exact structure:
{
  "meal_name": "Brief description of the meal",
  "items": ["list", "of", "identified", "foods"],
  "calories": number (total estimated calories),
  "protein_g": number (grams of protein),
  "carbs_g": number (grams of carbohydrates),
  "fat_g": number (grams of fat),
  "fiber_g": number (grams of fiber),
  "serving_size": "estimated portion size",
  "confidence": "low" | "medium" | "high",
  "notes": "any relevant notes about the estimation"
}

Be realistic with estimates. If you can't identify the food clearly, set confidence to "low".
Round all numbers to whole integers.`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this meal image and estimate the nutritional content. Provide your response as JSON only.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high',
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'GPT-4 Vision API error');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      // Parse JSON from response
      let nutritionData;
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nutritionData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse nutrition data:', content);
        return { success: false, error: 'Failed to parse AI response' };
      }

      return {
        success: true,
        data: {
          meal_name: nutritionData.meal_name || 'Meal',
          calories: nutritionData.calories || 0,
          protein_g: nutritionData.protein_g || 0,
          carbs_g: nutritionData.carbs_g || 0,
          fat_g: nutritionData.fat_g || 0,
          fiber_g: nutritionData.fiber_g || 0,
          serving_size: nutritionData.serving_size || 'As pictured',
          source: 'photo_estimate',
          ai_confidence: getConfidenceScore(nutritionData.confidence),
          notes: nutritionData.notes,
          items: nutritionData.items,
        },
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('Photo estimation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get meal suggestions based on remaining macros
   */
  async getMealSuggestions(remainingMacros, preferences, apiKey) {
    if (!apiKey) {
      return { success: false, error: 'OpenAI API key required' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert. Suggest meals based on remaining macro targets.
              
Your response MUST be valid JSON array with this structure:
[
  {
    "meal_name": "Meal name",
    "description": "Brief description",
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "prep_time": "X minutes",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Suggest 3-5 practical meal options.`,
            },
            {
              role: 'user',
              content: `Suggest meals for someone who needs approximately:
- ${remainingMacros.calories} more calories
- ${remainingMacros.protein}g more protein
- ${remainingMacros.carbs}g more carbs
- ${remainingMacros.fat}g more fat

${preferences?.dietaryRestrictions?.length 
  ? `Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}` 
  : ''}
${preferences?.mealType ? `Meal type: ${preferences.mealType}` : ''}

Provide practical, easy-to-prepare options.`,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get meal suggestions');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      // Parse JSON from response
      let suggestions;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON array found');
        }
      } catch (parseError) {
        return { success: false, error: 'Failed to parse suggestions' };
      }

      return {
        success: true,
        data: suggestions,
      };
    } catch (error) {
      console.error('Get meal suggestions error:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Convert confidence level to numeric score
 */
function getConfidenceScore(confidence) {
  switch (confidence?.toLowerCase()) {
    case 'high':
      return 0.9;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.4;
    default:
      return 0.5;
  }
}

export default new NutritionAIService();


