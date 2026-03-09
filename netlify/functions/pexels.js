exports.handler = async function(event) {

    const searchQuery = event.queryStringParameters.query;
    const API_KEY = process.env.PEXELS_KEY;

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=40&orientation=landscape&people_count=0`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: API_KEY }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed fetching Pexels" }) };
    }
};