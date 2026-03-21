import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
    const genAI = new GoogleGenerativeAI("AIzaSyBjmfCdLHyEPmJaoldSUkLqlrAmBQlumpE");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello");
        console.log(result.response.text());
    } catch (e) {
        console.error("Full Error:", e.message);
        if (e.response) {
            console.error("Response:", e.response);
        }
    }
}
main();
