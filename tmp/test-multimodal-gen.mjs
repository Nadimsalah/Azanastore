import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function main() {
    const key = "AIzaSyAKSqDkf6lqp-J9p3fgcDiE64pNqTkLI4E";
    const genAI = new GoogleGenerativeAI(key);

    try {
        // الحصول على موديل الصور
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        // هنا استبدل dummyBase64 بالصورة الفعلية التي تريد تعديلها
        const inputImageBase64 = fs.readFileSync("product.png", { encoding: "base64" });

        const prompt = `
            Transform this product photo into a professional studio shot.
            Keep all product details, textures, colors, and design 100% intact.
            Only enhance lighting, remove background distractions, and improve presentation.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: { data: inputImageBase64, mimeType: "image/png" }
            }
        ]);

        const response = await result.response;

        // إيجاد البيانات المولدة
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart) {
            const outputBase64 = imagePart.inlineData.data;
            fs.writeFileSync("product_enhanced.png", Buffer.from(outputBase64, "base64"));
            console.log("Success! Image saved as product_enhanced.png");
        } else {
            console.log("No image generated in response.");
        }

    } catch (e) {
        console.error("Image enhancement failed:", e.message);
    }
}

main();