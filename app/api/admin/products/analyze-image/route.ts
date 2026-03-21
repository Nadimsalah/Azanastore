import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAIPrompts } from "@/lib/supabase-api";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const { image } = await req.json()
        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 })
        }

        const base64Data = image.split(',')[1] || image;
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. ANALYZE METADATA (Gemini 2.5 Flash)
        const customPrompts = await getAIPrompts()
        
        const metadataModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const systemPrompt = `Analyze this product image and provide:
1. ${customPrompts?.title_prompt || "A catchy title in Moroccan Darija (Arabic script only, no French)."}
2. ${customPrompts?.description_prompt || "A professional marketing description in Moroccan Darija (Arabic script only, no French)."}
3. The most likely product category (e.g., Jelaba, Gandoura, Kaftan, Accessories, etc.).

Return ONLY valid JSON in this format:
{
  "title": "...",
  "description": "...",
  "category": "..."
}`;

        const metaResult = await metadataModel.generateContent([
            systemPrompt,
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);

        const metaText = metaResult.response.text();
        const jsonMatch = metaText.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : metaText);

        // 2. GENERATE NEW IMAGE with Gemini 2.5 Flash Image (Multimodal Image-to-Image!)
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const imagePrompt = customPrompts?.image_prompt || `USER REQUEST: Transform the uploaded clothing image into a professional fashion e-commerce product photo.

CRITICAL INSTRUCTION: 
PULL BACK SIGNIFICANTLY. The entire product must be seen from top to bottom (neckline to floor/hem). 
The product should only occupy about 60-70% of the frame center.
Leave wide empty white margins on all FOUR sides (top, bottom, left, right). 
DO NOT CROP any part of the garment. It must be 100% visible.
The design, colors, and patterns must remain EXACTLY identical to the original image.

STYLE & ENVIRONMENT:
Clean studio fashion photography, perfectly centered, square format (1:1), pure white background (#FFFFFF), soft professional lighting, natural subtle shadow.
Remove ALL distractions (hangers, tags, people, store background, mannequins).
The final image must be a 2000x2000 pixel high-resolution catalog shot where the full body of the garment is clear.`;

        let proImage = image; 
        let errorMsg = null;

        try {
            // Passing BOTH the text prompt and the original image for "Visual Conditioning"
            const imageResult = await imageModel.generateContent([
                imagePrompt,
                { inlineData: { data: base64Data, mimeType: mimeType } }
            ]);
            const response = await imageResult.response;
            const parts = response.candidates?.[0]?.content?.parts || [];

            // Find the image part in the response
            const imagePart = parts.find(p => p.inlineData);
            if (imagePart?.inlineData?.data) {
                proImage = `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
            } else {
                errorMsg = "No image found in AI response. Fallback to original.";
                console.warn("AI did not return an image part:", parts);
            }
        } catch (e: any) {
            errorMsg = `Image generation model error: ${e.message}`;
            console.error("Gemini 2.5 Image generation failed:", e);
        }

        return NextResponse.json({
            ...data,
            proImage: proImage,
            imagenError: errorMsg
        });

    } catch (error: any) {
        console.error('Final Processing Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
