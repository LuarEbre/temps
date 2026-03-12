export default async (request, context) => {
    const url = new URL(request.url);
    
    let seed = decodeURIComponent(url.pathname.replace(/^\/+/g, '')).substring(0, 10);

    if (!seed || seed === 'index.html') {
        seed = 'Play temps!';
    }

    const response = await context.next();
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("text/html")) {
        let html = await response.text();

        html = html.replace(/TEMPS_DYNAMIC_TITLE/g, `${seed} 🎲`);
        return new Response(html, response);
    }

    return response;
};