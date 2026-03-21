async function main() {
    const key = "AIzaSyAKSqDkf6lqp-J9p3fgcDiE64pNqTkLI4E";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            console.log(data.models.map(m => m.name).join("\n"));
        } else {
            console.error("No models found. Error:", JSON.stringify(data));
        }
    } catch (e) {
        console.error(e);
    }
}
main();
