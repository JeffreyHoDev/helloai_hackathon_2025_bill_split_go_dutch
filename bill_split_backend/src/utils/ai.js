const { GoogleGenerativeAI } = require('@google/generative-ai');

// TODO: Replace with your Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const analyzeReceiptWithAI = async (receiptDataUri) => {
  try {
    // Convert data URI to a format acceptable by Gemini
    const parts = receiptDataUri.split(';base64,');
    const mimeType = parts[0].split(':')[1];
    const base64Data = parts[1];

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const prompt = `You are an expert receipt processor. Analyze the provided receipt image and extract the individual line items, including their names and prices. Also, provide a general title for the receipt based on the store or contents. Ignore taxes, totals, or any other summary lines. Focus only on the purchased items.

Additionally, identify the total tax amount and service charge amount from the receipt. If these are not explicitly stated, assume them to be 0.

Provide the output as a JSON object with the following structure:
{
  "title": "A short, descriptive title for the receipt (e.g., \"Dinner at The Cafe\", \"Weekly Groceries\").",
  "items": [
    {
      "name": "The name of the item.",
      "price": "The price of the item as a number."
    }
  ],
  "tax": "The total tax amount as a number. Default to 0 if not found.",
  "serviceCharge": "The total service charge amount as a number. Default to 0 if not found."
}
`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = text;
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    // Attempt to parse the JSON response
    try {
      const parsed = JSON.parse(jsonString);
      // Basic validation to ensure it matches the expected structure
      if (parsed.title && Array.isArray(parsed.items)) {
        return parsed;
      } else {
        console.error("AI response did not match expected structure:", text);
        return { error: 'AI analysis failed: Invalid response structure.', details: text };
      }
    } catch (jsonError) {
      console.error("Failed to parse AI response as JSON:", text, jsonError);
      return { error: 'AI analysis failed: Invalid JSON response.', details: text };
    }

  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    return { error: 'AI analysis failed', details: error.message };
  }
};

module.exports = { analyzeReceiptWithAI };