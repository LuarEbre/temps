let allCities = [];
let cumulativeWeights = [];
let totalWeight = 0;
let city1 = null;
let city2 = null;
let nextCity = null;
let cityImage1 = null;
let cityImage2 = null;
let nextCityImage = null;
let cityWeather1 = null;
let cityWeather2 = null;
let nextCityWeather = null;

// game starts in Celsius, with later additions adding a unit switching button
let unit = "C";

function initializeCopyright() {
    const copyrightDiv = document.getElementById('copyright-text');
    const currentYear = new Date().getFullYear();
    copyrightDiv.textContent = `© ${currentYear} temps`;
}

function initializeEventListeners() {
    const landingPage = document.querySelector('.landing');
    landingPage.addEventListener('click', () => {
    landingPage.classList.add('fade-out');
    });
}

function fadeIn() {
    const landingText = document.querySelector('.landing-popup');
    const landingLogo = document.querySelector('.landing-logo');
    setTimeout(() => {
    landingLogo.classList.add('fade-in');
    }, 10);

    setTimeout(() => {
        landingText.classList.add('fade-in');
    }, 800);
}

function initializeParser() {

    Papa.parse("worldcities.csv", {
    download: true,       
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {

        allCities = results.data;
        console.log(`CSV loaded! ${allCities.length} cities available!`);
        
        allCities.forEach(city => {
        const weight = Number(city.weight || 0);
        totalWeight += weight;
        cumulativeWeights.push(totalWeight);
        });
        // draw the two initial cities that will be displayed
        drawTwoRandomCities();
    }
    });
}

function init() {
    initializeParser();
    initializeCopyright();
    initializeEventListeners();
    fadeIn();
}

// PEXELS API CALL
async function fetchCityImage(city) {

    const pexelsApiKey = PEXELS_KEY;
    
    let searchQuery = null;

    // only search for images corresponding to country if city is obscure
    if(city.population<10000) {
        searchQuery = `${city.country} sights landscape`;
    } else {
        searchQuery = `${city.city_ascii}, ${city.country} sights landscape`;
    }
    
    // build search URL with encodeURICOmponent
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: pexelsApiKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // check if an image is found
        if (data.photos && data.photos.length > 0) {

            const imageUrl = data.photos[0].src.landscape; 
            const photographer = data.photos[0].photographer;
            const photographerURL = data.photos[0].photographer_url;

            return {
                url: imageUrl,
                photographer: photographer,
                photographerLink: photographerURL
            };

        } else {
            // should not happen
            console.log(`No image found for ${city.city_ascii}`);
            return null; 
        }
        
    } catch (error) {
        console.error(`Pexels API error: displaying placeholder image for ${city.city_ascii}`, error);
        return null;
    }
}

// OPENWEATHER API CALL
async function getWeatherInCity(city) {

    const apiKey = OPEN_WEATHER_KEY;

    // build search URL
    const url = `https://pro.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.main) {

            const temperature = data.main.temp;
            const localTimeMs = (data.dt + data.timezone) * 1000;

            const dateObj = new Date(localTimeMs);
            const formattedTime = dateObj.toLocaleTimeString('en-US', { 
                timeZone: 'UTC', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return {
                temperature: temperature,
                localTime: formattedTime
            };

        } else {
            // should not happen
            console.log(`No weather data found for ${city.city_ascii}`);
            return null; 
        }
        
    } catch (error) {
        console.error("OpenWeather API error!", error);
        return null;
    }
}

// binary search approach utilizing cumulativeWeights
function getWeightedRandomCity() {

    const target = Math.random() * totalWeight;
    let low = 0;
    let high = cumulativeWeights.length - 1;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (cumulativeWeights[mid] < target) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return allCities[low];
}

// only used once for the intial drawing of 2 cities
async function drawTwoRandomCities() 
{
    city1 = getWeightedRandomCity();
    city2 = getWeightedRandomCity();
    // already fetch the next cities image to decrease loading time
    nextCity = getWeightedRandomCity();

    while (city1.id === city2.id) {
        city2 = getWeightedRandomCity();
    }

    while (city2.id == nextCity.id) {
        nextCity = getWeightedRandomCity();
    }

    // apply styles which can already be applied, with fallback images before the images have been loaded
    applyStyles();

    console.log(`Fetching image for ${city1.city_ascii}...`);
    cityImage1 = await fetchCityImage(city1);
    cityWeather1 = await getWeatherInCity(city1);
    
    console.log(`Fetching image for ${city2.city_ascii}...`);
    cityImage2 = await fetchCityImage(city2);
    cityWeather2 = await getWeatherInCity(city2);

    // apply styles once both images & weather are loaded
    applyStyles();

    console.log(`Fetching image for ${nextCity.city_ascii}...`);
    nextCityImage = await fetchCityImage(nextCity);
    nextCityWeather = await getWeatherInCity(nextCity);
}

async function cycleCities() {

    city1 = city2;
    city2 = nextCity;
    cityImage1 = cityImage2;
    cityImage2 = nextCityImage;
    cityWeather1 = cityWeather2;
    cityWeather2 = nextCityWeather;
    applyStyles();

    // get new cached city + image after cycling
    nextCity = getWeightedRandomCity();

    // ensure unique next city
    while (nextCity.id === city1.id || nextCity.id === city2.id) {
        nextCity = getWeightedRandomCity();
    }
    nextCityImage = await fetchCityImage(nextCity);
    nextCityWeather = await getWeatherInCity(nextCity);
}

function formatTemperature(celsiusTemp) {
    if (unit === "C") {
        return celsiusTemp.toFixed(2);
    } else if (unit === "F") {
        return (celsiusTemp * (9/5) + 32).toFixed(2);
    }
}

function applyStyles() {

    // change UI strings to match cities
    document.getElementById("left-city").innerHTML = `${city1.city_ascii}, ${city1.country}'s`;
    document.getElementById("right-city").innerHTML = `${city2.city_ascii}, ${city2.country}'s`;
    document.getElementById("left-city-2").innerHTML = `than ${city1.city_ascii}'s current temperature`;

    const leftSide = document.querySelector('.split-left');
    const leftCopyright = document.querySelector("#copyright-left a");
    const rightSide = document.querySelector('.split-right');
    const rightCopyright = document.querySelector("#copyright-right a");
    const leftTemperature = document.getElementById("left-temp");
    const leftTime = document.getElementById("local-time-left");
    const rightTime = document.getElementById("local-time-right");

    // change background images to match cities
    // change photography accredation to match image
    if (cityImage1) {
        leftSide.style.backgroundImage = `url('${cityImage1.url}')`;
        leftCopyright.href = cityImage1.photographerLink;
        leftCopyright.innerText = cityImage1.photographer;
        document.getElementById("accreditation-left").innerHTML = "<i>provided by Pexels</i>"
    } else {
        leftSide.style.backgroundImage = `url(https://placehold.co/1920x1080?text=?)`;
        leftCopyright.href = "";
        leftCopyright.innerText = "";
        document.getElementById("accreditation-left").innerHTML = ""
    }

    if (cityImage2) {
        rightSide.style.backgroundImage = `url('${cityImage2.url}')`;
        rightCopyright.href = cityImage2.photographerLink;
        rightCopyright.innerText = cityImage2.photographer;
        document.getElementById("accreditation-right").innerHTML = "<i>provided by Pexels</i>"
    } else {
        rightSide.style.backgroundImage = `url(https://placehold.co/1920x1080?text=?)`;
        rightCopyright.href = "";
        rightCopyright.innerText = "";
        document.getElementById("accreditation-right").innerHTML = "";
    }

    // update left side's temperature string as well as both local times
    if (cityWeather1) {
        leftTemperature.innerHTML = `${formatTemperature(cityWeather1.temperature)}°${unit}`;
        leftTime.innerHTML = cityWeather1.localTime;
    } else {
        leftTemperature.innerHTML = `--.--°${unit}`;
        leftTime.innerHTML = "--:-- XX"
    }

    if(cityWeather2) {
        rightTime.innerHTML = cityWeather2.localTime;
    } else {
        rightTime.innerHTML = "--:-- XX"
    }
}

init();