import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
    const key = "AIzaSyBjmfCdLHyEPmJaoldSUkLqlrAmBQlumpE";
    // Using fetch directly as SDK might not easily support ListModels with plain key
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
main();
