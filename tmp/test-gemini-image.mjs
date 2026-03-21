import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
    const key = "AIzaSyAKSqDkf6lqp-J9p3fgcDiE64pNqTkLI4E";
    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const result = await model.generateContent("Create a professional product photo of a black velvet Moroccan dress on a white background.");
        const response = await result.response;
        console.log("Success! Full Response Head:", JSON.stringify(response).substring(0, 500));
        // Check if there's an image part in the output
        const parts = response.candidates?.[0]?.content?.parts;
        console.log("Parts Types:", parts?.map(p => Object.keys(p)).join(", "));
    } catch (e) {
        console.error("Test gemini-2.5-flash-image failed:", e.message);
    }
}
main();
