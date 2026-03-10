let allCities = [];
let cumulativeWeights = [];
let totalWeight = 0;

let clockInterval = null;

let score = 0;

let cityObjects = [
    // left city
    { city: null, images: null, weather: null },
    // right city
    { city: null, images: null, weather: null },
    // cached city
    { city: null, images: null, weather: null }
];

/** @type {"C" | "F"} */
let unit = "C";

function startLiveClocks() {

    if (clockInterval) clearInterval(clockInterval);

    // get both local-time blocks
    const leftTime = document.getElementById("local-time-left");
    const rightTime = document.getElementById("local-time-right");

    // run loop every 1000ms
    clockInterval = setInterval(() => {
        // current UTC time
        const now = Date.now();

        if (cityObjects[0].weather) {
            const localMs1 = now + (cityObjects[0].weather.timezone * 1000);
            leftTime.innerHTML = new Date(localMs1).toLocaleTimeString('en-US', { 
                timeZone: 'UTC', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }

        if (cityObjects[1].weather) {
            const localMs2 = now + (cityObjects[1].weather.timezone * 1000);
            rightTime.innerHTML = new Date(localMs2).toLocaleTimeString('en-US', { 
                timeZone: 'UTC', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }, 1000);
}

function initializeButtons() {

    document.getElementById("higher-button").addEventListener('click', () => handleClick("higher"));
    document.getElementById("lower-button").addEventListener('click', () => handleClick("lower"));
    document.getElementById("unit-button").addEventListener('click', () => toggleUnits());
    document.getElementById("play-again-button").addEventListener('click', () => playAgain());
}

function handleClick(choice) {

    // if a city object hasn't been loaded, do nothing
    if(!cityObjects[0] || !cityObjects[1]) {
        return;
    }

    // higher = true if right city's temperature is higher
    const isHigher = (cityObjects[0].weather.temperature <= cityObjects[1].weather.temperature);

    // user has correctly identified the right city to have a higher temperature
    if(isHigher&&(choice=="higher")) {

        flashFilter("red");
        score++;
        cycleCities();
    }
    // user has correctly identified the right city to have a lower temperature
    else if(!isHigher&&(choice=="lower")) {

        flashFilter("blue");
        score++;
        cycleCities();
    }
    // user is incorrect
    else {

        // display user's score
        const scoreDisplay = document.getElementById("final-score");
        scoreDisplay.innerHTML = score;

        // fade in GAME OVER screen
        const gameOverScreen = document.querySelector(".game-over");
        gameOverScreen.classList.add("visible");

        const delayInMs = getTransitionLengthMS(gameOverScreen);

        // --transition-length long timeout to avoid next round rendering before the GAME OVER screen is visible
        setTimeout(() => {
            drawTwoRandomCities();
        }, delayInMs);
    }
}

function getTransitionLengthMS(element) {

    const rawTime = getComputedStyle(element).getPropertyValue('--transition-length').trim();

    if(rawTime != "") return parseFloat(rawTime); 
    else return 0;
}

function flashFilter(color) {

    const popUpLeft = document.getElementById("color-popup-left");
    const popUpRight = document.getElementById("color-popup-right");
    
    const delayInMS = getTransitionLengthMS(popUpLeft);

    if(color!="red" && color!="blue") return;
    popUpLeft.classList.add(`${color}-filter`);
    popUpRight.classList.add(`${color}-filter`);

    setTimeout(() => {
    popUpLeft.classList.remove(`${color}-filter`);
    popUpRight.classList.remove(`${color}-filter`);
    }, delayInMS);
}

function toggleUnits() {

    if(unit=="C") unit = "F";
    else if(unit=="F") unit = "C";

    applyTemperature();

    document.getElementById("unit-button").setAttribute('data-unit', unit);
}

function playAgain() {

    score = 0;
    document.getElementById("current-score").innerHTML = score;
    document.querySelector(".game-over").classList.remove("visible");
}

function initializeCopyright() {

    const copyrightDiv = document.getElementById('copyright-text');
    const copyrightDiv2 = document.getElementById('game-over-copyright-text');
    const currentYear = new Date().getFullYear();
    copyrightDiv.textContent = `© ${currentYear} temps`;
    copyrightDiv2.textContent = `© ${currentYear} temps`;
}

function initializeEventListeners() {

    const infoBox = document.querySelector('.information');
    infoBox.addEventListener('click', function(event) {
        event.stopPropagation();
    });

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

function initializeHoverEffects() {
    const buttons = document.querySelectorAll('#higher-button, #lower-button, #unit-button, #play-again-button');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = Math.round((x / rect.width) * 100);
            const yPercent = Math.round((y / rect.height) * 100);
            
            btn.style.setProperty('--mouse-x', `${xPercent}%`);
            btn.style.setProperty('--mouse-y', `${yPercent}%`);
        });
    });
}

function init() {

    startLiveClocks();
    initializeParser();
    initializeCopyright();
    initializeEventListeners();
    initializeButtons();
    initializeHoverEffects();
    fadeIn();
}

// PEXELS API CALL
async function fetchCityImage(city) {

    let isObscure = false;
    let searchQuery = null;

    // only search for images corresponding to city's country if the city is "obscure"
    if(city.population<100000) {
        isObscure = true;
        searchQuery = `${city.country}`;
    } else {
        searchQuery = `${city.city_ascii}, ${city.country}`;
    }
    
    // API call wrapped by /.netlify/functions
    const url = `/.netlify/functions/pexels?query=${encodeURIComponent(searchQuery)}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // check if an image is found
        if (data.photos && data.photos.length > 0) {
            
            // build array of image objects with url, photographer, and photographerLink strings
            const imageArray = data.photos.map(photo => {
                return {
                    url: photo.src.large2x,
                    photographer: photo.photographer,
                    photographerLink: photo.photographer_url
                };
            });

            if (isObscure) {
                const randomIndex = Math.floor(Math.random() * imageArray.length);
                // return an array of only the randomly selected image
                return [imageArray[randomIndex]];
            } else {
                return imageArray;
            }

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

    // API call wrapped by /.netlify/functions
    const url = `/.netlify/functions/openWeather?lat=${city.lat}&lon=${city.lng}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.main) {

            const temperature = data.main.temp;
            const timezone = data.timezone;

            return {
                temperature: temperature,
                timezone: timezone
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
async function drawTwoRandomCities() {

    // disable buttons while waiting for cities & data to load
    document.getElementById("higher-button").disabled = true;
    document.getElementById("lower-button").disabled = true;

    cityObjects[0].city = getWeightedRandomCity();
    cityObjects[1].city = getWeightedRandomCity();
    // already fetch the next cities image to decrease loading time
    cityObjects[2].city = getWeightedRandomCity();

    while (cityObjects[0].city.id === cityObjects[1].city.id) {
        cityObjects[1].city = getWeightedRandomCity();
    }

    while (cityObjects[1].city.id == cityObjects[2].city.id) {
        cityObjects[2].city = getWeightedRandomCity();
    }

    // apply styles which can already be applied, with fallback images before the images have been loaded
    applyStyles();

    console.log(`Fetching image for ${cityObjects[0].city.city_ascii}...`);
    cityObjects[0].images = await fetchCityImage(cityObjects[0].city);
    cityObjects[0].weather = await getWeatherInCity(cityObjects[0].city);
    
    console.log(`Fetching image for ${cityObjects[1].city.city_ascii}...`);
    cityObjects[1].images = await fetchCityImage(cityObjects[1].city);
    cityObjects[1].weather = await getWeatherInCity(cityObjects[1].city);

    // apply styles once both images & weather are loaded
    applyStyles();

    // only re-enable after all (important) data has been loaded (ignoring cached city)
    document.getElementById("higher-button").disabled = false;
    document.getElementById("lower-button").disabled = false;

    console.log(`Fetching image for ${cityObjects[2].city.city_ascii}...`);
    cityObjects[2].images = await fetchCityImage(cityObjects[2].city);
    cityObjects[2].weather = await getWeatherInCity(cityObjects[2].city);

    
}

async function cycleCities() {

    // disable buttons while waiting for cities & data to load
    document.getElementById("higher-button").disabled = true;
    document.getElementById("lower-button").disabled = true;

    cityObjects[0].city = cityObjects[1].city;
    cityObjects[1].city = cityObjects[2].city;
    cityObjects[0].images = cityObjects[1].images;
    cityObjects[1].images = cityObjects[2].images;
    cityObjects[0].weather = cityObjects[1].weather;
    cityObjects[1].weather = cityObjects[2].weather;

    if (!document.startViewTransition) {
        // Fallback: Just snap instantly like normal for older browsers
        applyStyles(); 
    } else {
        // 2. The Magic: The browser handles the crossfade automatically!
        document.startViewTransition(() => {
            applyStyles();
        });
    }

    // get new cached city + image after cycling
    cityObjects[2].city = getWeightedRandomCity();

    // ensure unique next city
    while (cityObjects[2].city.id === cityObjects[0].city.id || cityObjects[2].city.id === cityObjects[1].city.id) {
        cityObjects[2].city = getWeightedRandomCity();
    }
    cityObjects[2].images = await fetchCityImage(cityObjects[2].city);
    cityObjects[2].weather = await getWeatherInCity(cityObjects[2].city);

    // only re-enable after data has been cycled and loaded
    document.getElementById("higher-button").disabled = false;
    document.getElementById("lower-button").disabled = false;
}

function formatEmoji(city) {

    const flagOverrides = {
        "QZ": "GB",
        "XD": "GB",
        "XG": "PS",
        "XW": "PS",
        "XR": "SJ",
        "XP": "CN"
    };

    // if no city / ISO2 column empty, return placeholder white flag
    if (!city || !city.iso2) {
        return "🏳️";
    }

    let iso2 = flagOverrides[city.iso2] || city.iso2;
    iso2 = iso2.toUpperCase();

    const UNICODE_OFFSET = 127397;

    return String.fromCodePoint(
        iso2.charCodeAt(0) + UNICODE_OFFSET,
        iso2.charCodeAt(1) + UNICODE_OFFSET
    );
}

function formatTemperature(celsiusTemp) {
    if (unit === "C") {
        return celsiusTemp.toFixed(2);
    } else if (unit === "F") {
        return (celsiusTemp * (9/5) + 32).toFixed(2);
    }
}

function swapUnits() {
    // TODO add button + change button's appearance based on current unit
    if(unit=="C") unit="F";
    else unit="C";
    // re-render the temperature with the other unit
    applyTemperature();
}

function applyTemperature() {

    const leftTemperature = document.getElementById("left-temp");

    if(cityObjects[0].weather) {
        leftTemperature.innerHTML = `${formatTemperature(cityObjects[0].weather.temperature)}°${unit}`;
    } else {
        leftTemperature.innerHTML = `--.--°${unit}`;
    }
}

function applyStyles() {

    document.getElementById("current-score").innerHTML = score;
    
    // change UI strings to match cities
    document.getElementById("left-city").innerHTML = `${cityObjects[0].city.city_ascii}, ${cityObjects[0].city.country}'s`;
    document.getElementById("right-city").innerHTML = `${cityObjects[1].city.city_ascii}, ${cityObjects[1].city.country}'s`;
    document.getElementById("left-city-2").innerHTML = `than ${cityObjects[0].city.city_ascii}'s current temperature`;

    const leftSide = document.querySelector('.split-left');
    const leftCopyright = document.querySelector("#copyright-left a");
    const rightSide = document.querySelector('.split-right');
    const rightCopyright = document.querySelector("#copyright-right a");

    // change background images to match cities
    // change photography accredation to match image
    if (cityObjects[0].images && cityObjects[0].images.length > 0) {
        leftSide.style.backgroundImage = `url('${cityObjects[0].images[0].url}')`;
        leftCopyright.href = cityObjects[0].images[0].photographerLink;
        leftCopyright.innerText = cityObjects[0].images[0].photographer;
        document.getElementById("accreditation-left").innerHTML = "<i>provided by Pexels</i>"
    } else {
        leftSide.style.backgroundImage = `url(https://placehold.co/1920x1080?text=?)`;
        leftCopyright.href = "";
        leftCopyright.innerText = "";
        document.getElementById("accreditation-left").innerHTML = ""
    }

    if (cityObjects[1].images && cityObjects[1].images.length > 0) {
        rightSide.style.backgroundImage = `url('${cityObjects[1].images[0].url}')`;
        rightCopyright.href = cityObjects[1].images[0].photographerLink;
        rightCopyright.innerText = cityObjects[1].images[0].photographer;
        document.getElementById("accreditation-right").innerHTML = "<i>provided by Pexels</i>"
    } else {
        rightSide.style.backgroundImage = `url(https://placehold.co/1920x1080?text=?)`;
        rightCopyright.href = "";
        rightCopyright.innerText = "";
        document.getElementById("accreditation-right").innerHTML = "";
    }

    applyTemperature();

    document.getElementById("left-emoji").innerHTML = formatEmoji(cityObjects[0].city);
    document.getElementById("right-emoji").innerHTML = formatEmoji(cityObjects[1].city);
}

init();