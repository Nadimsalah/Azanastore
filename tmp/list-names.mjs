async function main() {
    const key = "AIzaSyBjmfCdLHyEPmJaoldSUkLqlrAmBQlumpE";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(data.models.map(m => m.name).join("\n"));
    } catch (e) {
        console.error(e);
    }
}
main();
