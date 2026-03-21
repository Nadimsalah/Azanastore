async function main() {
    const key = "AIzaSyAKSqDkf6lqp-J9p3fgcDiE64pNqTkLI4E";
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
