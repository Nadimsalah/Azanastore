import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
    const genAI = new GoogleGenerativeAI("AIzaSyBjmfCdLHyEPmJaoldSUkLqlrAmBQlumpE");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Found gemini-1.5-flash");
    } catch (e) {
        console.error(e);
    }
}
main();
