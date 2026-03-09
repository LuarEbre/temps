exports.handler = async function(event) {

    const lat = event.queryStringParameters.lat;
    const lon = event.queryStringParameters.lon;
    const API_KEY = process.env.OPEN_WEATHER_KEY;

    const url = `https://pro.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed fetching Weather" }) };
    }
};