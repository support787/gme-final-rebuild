import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the Gemini client using the key from your .env.local file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    // 1. Get the image from the admin page
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 2. Hand the image to Gemini with very strict instructions
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash', 
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: imageBase64.split(',')[1], // Clean the Base64 string
                            mimeType: "image/jpeg" 
                        }
                    },
                    {
                        text: `You are an expert at reading medical equipment labels and stickers. 
                        Analyze this image, extract the following information, and return it STRICTLY as a JSON object:
                        {
                          "partNumber": "string or null",
                          "manufacturer": "string or null",
                          "description": "string or null"
                        }
                        Do not include any markdown formatting, backticks, or conversational text. Return ONLY the raw JSON object.`
                    }
                ]
            }
        ]
    });

    // 3. Clean up the response and send it back to the admin page
    let rawText = response.text;
    const partData = JSON.parse(rawText);

    return NextResponse.json({ success: true, data: partData });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}