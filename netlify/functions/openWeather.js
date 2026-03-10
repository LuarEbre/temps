exports.handler = async function(event) {

    const lat = event.queryStringParameters.lat;
    const lon = event.queryStringParameters.lon;
    const API_KEY = process.env.OPEN_WEATHER_KEY;

    const weatherUrl = `https://pro.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const elevationUrl = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;

    try {
        const [weatherResponse, elevationResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(elevationUrl)
        ]);
        
        if (!weatherResponse.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const weatherData = await weatherResponse.json();
        const elevationData = await elevationResponse.json();

        const temperature = weatherData.main ? weatherData.main.temp : null;
        const timezone = weatherData.timezone ? weatherData.timezone : null;
        
        const elevation = elevationData.elevation ? elevationData.elevation[0] : null;

        const cleanData = {
            temperature: temperature,
            timezone: timezone,
            elevation: elevation
        };

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanData)
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed fetching data" }) };
    }
};