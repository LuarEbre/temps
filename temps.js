/* ================================================================================================
                                       VARIABLES & CONSTANTS
=================================================================================================*/

(function() {
    const gameStates = {
        score: 0,
        highscore: 0,
        cities: [],
        cumulativeWeights: [],
        totalWeight: 0,
        temperatureUnit: "C",
        heightUnit: "m"
    };

    let cityObjects = [
        // left city
        { city: null, images: null, weather: null },
        // right city
        { city: null, images: null, weather: null },
        // cached city
        { city: null, images: null, weather: null }
    ];

    // all DOM elements which get used repeatedly throughout the gameplay
    const DOM = {

        higherButton: document.getElementById("higher-button"),
        lowerButton: document.getElementById("lower-button"),

        leftTemperature: document.getElementById("left-temp"),

        leftTime: document.getElementById("local-time-left"),
        rightTime: document.getElementById("local-time-right"),

        leftElevation: document.getElementById("elevation-left"),
        rightElevation: document.getElementById("elevation-right"),

        currentScore: document.getElementById("current-score"),
        highscore: document.getElementById("highscore"),

        leftCityString: document.getElementById("left-city"),
        rightCityString: document.getElementById("right-city"),
        leftCityStringRight: document.getElementById("left-city-2"),

        leftSide: document.querySelector('.split-left'),
        rightSide: document.querySelector('.split-right'),

        leftCopyright: document.querySelector("#copyright-left a"),
        rightCopyright: document.querySelector("#copyright-right a"),
        photoCreditLeft: document.getElementById("accreditation-left"),
        photoCreditRight: document.getElementById("accreditation-right"),

        leftEmoji: document.getElementById("left-emoji"),
        rightEmoji: document.getElementById("right-emoji")
    };

    let clockInterval = null;

/* ================================================================================================
                                           INITIALIZATION
=================================================================================================*/

function initializeLiveClocks() {

    if (clockInterval) clearInterval(clockInterval);

    // run loop every 1000ms
    clockInterval = setInterval(() => {
        // current UTC time
        const now = Date.now();

        if (cityObjects[0].weather) {
            const localMs1 = now + (cityObjects[0].weather.timezone * 1000);
            DOM.leftTime.innerHTML = new Date(localMs1).toLocaleTimeString('en-US', { 
                timeZone: 'UTC', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }

        if (cityObjects[1].weather) {
            const localMs2 = now + (cityObjects[1].weather.timezone * 1000);
            DOM.rightTime.innerHTML = new Date(localMs2).toLocaleTimeString('en-US', { 
                timeZone: 'UTC', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }, 1000);
}

function initializeHoverEffects() {
    const buttons = document.querySelectorAll('#higher-button, #lower-button, #temperature-button, #height-button, #play-again-button');

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

function initializeEventListeners() {

    const infoBox = document.querySelector('.information');
    infoBox.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    const landingPage = document.querySelector('.landing');
    landingPage.addEventListener('click', () => {
        landingPage.classList.add('fade-out');
    });

    DOM.higherButton.addEventListener('click', () => handleClick("higher"));
    DOM.lowerButton.addEventListener('click', () => handleClick("lower"));
    document.getElementById("temperature-button").addEventListener('click', () => toggleTemperatureUnits());
    document.getElementById("height-button").addEventListener('click', () => toggleHeightUnits());
    document.getElementById("play-again-button").addEventListener('click', () => playAgain());
}

function initializeCopyright() {

    const copyrightDiv = document.getElementById('copyright-text');
    const copyrightDiv2 = document.getElementById('game-over-copyright-text');
    const currentYear = new Date().getFullYear();
    if (currentYear > 2026) {
        copyrightDiv.textContent = `© 2026 - ${currentYear} temps`;
        copyrightDiv2.textContent = `© 2026 - ${currentYear} temps`;
    } else {
        copyrightDiv.textContent = `© ${currentYear} temps`;
        copyrightDiv2.textContent = `© ${currentYear} temps`;
    }
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

        gameStates.cities = results.data;
        
        gameStates.cities.forEach(city => {
        const weight = Number(city.weight || 0);
        gameStates.totalWeight += weight;
        gameStates.cumulativeWeights.push(gameStates.totalWeight);
        });
        // draw the two initial cities that will be displayed
        drawInitialCities();
    }
    });
}

function loadHighscore() {
    gameStates.highscore = localStorage.getItem("temps_highscore") || 0;
    DOM.highscore.innerHTML = gameStates.highscore;
}

function init() {

    initializeCopyright();
    initializeParser();
    initializeEventListeners();
    initializeHoverEffects();
    initializeLiveClocks();
    loadHighscore();
    fadeIn();
}

/* ================================================================================================
                                           BUTTON EVENTS
=================================================================================================*/

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
        gameStates.score++;
        gameStates.highscore = Math.max(gameStates.score, gameStates.highscore);
        cycleCities();
    }
    // user has correctly identified the right city to have a lower temperature
    else if(!isHigher&&(choice=="lower")) {

        flashFilter("blue");
        gameStates.score++;
        gameStates.highscore = Math.max(gameStates.score, gameStates.highscore);
        cycleCities();
    }
    // user is incorrect
    else {

        // save user's highscore
        localStorage.setItem("temps_highscore", gameStates.highscore);

        // display user's score
        const scoreDisplay = document.getElementById("final-score");
        scoreDisplay.innerHTML = gameStates.score;

        // fade in GAME OVER screen
        const gameOverScreen = document.querySelector(".game-over");
        gameOverScreen.classList.add("visible");

        const delayInMs = getTransitionLengthMS(gameOverScreen);

        // --transition-length long timeout to avoid next round rendering before the GAME OVER screen is visible
        setTimeout(() => {
            // draw new cities for smooth replayability
            drawInitialCities();
        }, delayInMs);
    }
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

function toggleTemperatureUnits() {

    if(gameStates.temperatureUnit=="C") gameStates.temperatureUnit = "F";
    else if(gameStates.temperatureUnit=="F") gameStates.temperatureUnit = "C";

    applyTemperature();

    document.getElementById("temperature-button").setAttribute('data-unit', gameStates.temperatureUnit);
}

function toggleHeightUnits() {

    if(gameStates.heightUnit=="m") gameStates.heightUnit = "ft";
    else if(gameStates.heightUnit=="ft") gameStates.heightUnit = "m";

    applyElevation();

    document.getElementById("height-button").setAttribute('data-unit', gameStates.heightUnit);
}

function playAgain() {

    gameStates.score = 0;
    DOM.currentScore.innerHTML = gameStates.score;
    document.querySelector(".game-over").classList.remove("visible");
}

/* ================================================================================================
                                             API CALLS
=================================================================================================*/

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
                return [imageArray[0]];
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
        
        if (data.temperature !== null) {

            const temperature = data.temperature;
            const timezone = data.timezone;
            const elevation = data.elevation;

            return {
                temperature: temperature,
                timezone: timezone,
                elevation: elevation
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

/* ================================================================================================
                                          HELPER FUNCTIONS
=================================================================================================*/

// gets an element's transition length, e.g. "550ms" and trims it to only the float
// element must have a "--transition-length" variable and it must be saved in ms
function getTransitionLengthMS(element) {

    const rawTime = getComputedStyle(element).getPropertyValue('--transition-length').trim();

    if(rawTime != "") return parseFloat(rawTime); 
    else return 0;
}

// formats temperature to current unit with 2 decimal places
function formatTemperature(celsiusTemp) {
    if (gameStates.temperatureUnit === "C") {
        return celsiusTemp.toFixed(2);
    } else if (gameStates.temperatureUnit === "F") {
        return (celsiusTemp * (9/5) + 32).toFixed(2);
    }
}

// format elevation to current unit and floor it remove any decimal places
function formatElevation(meterHeight) {
    if (gameStates.heightUnit === "m") {
        return Math.floor(meterHeight);
    } else if (gameStates.heightUnit === "ft") {
        return Math.floor(meterHeight*3.281)
    }
}

// format's a city's iso2 code into a flag emoji
function formatEmoji(city) {

    // override if no flag for territory exists
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

/* ================================================================================================
                                               LOGIC
=================================================================================================*/

// only used for the intial drawing of 2 cities at the beginning of each round
// assigns all 3 cityObjects a random city (checks for duplicates), along with image and weather data
async function drawInitialCities() {

    // disable buttons while waiting for cities & data to load
    DOM.higherButton.disabled = true;
    DOM.lowerButton.disabled = true;

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

    cityObjects[0].images = await fetchCityImage(cityObjects[0].city);
    cityObjects[0].weather = await getWeatherInCity(cityObjects[0].city);
    
    cityObjects[1].images = await fetchCityImage(cityObjects[1].city);
    cityObjects[1].weather = await getWeatherInCity(cityObjects[1].city);

    // apply styles once both images & weather are loaded
    applyStyles();

    cityObjects[2].images = await fetchCityImage(cityObjects[2].city);
    cityObjects[2].weather = await getWeatherInCity(cityObjects[2].city);

    // only re-enable after ALL cities including images & weather have been loaded
    DOM.higherButton.disabled = false;
    DOM.lowerButton.disabled = false;
}

// cycles the cities from right to left, with the right city becoming the new left city, and the cached city being swapped into the right city
// caches a new city for smooth gameplay
async function cycleCities() {

    // disable buttons while waiting for cities & data to load
    DOM.higherButton.disabled = true;
    DOM.lowerButton.disabled = true;

    cityObjects[0].city = cityObjects[1].city;
    cityObjects[1].city = cityObjects[2].city;
    cityObjects[0].images = cityObjects[1].images;
    cityObjects[1].images = cityObjects[2].images;
    cityObjects[0].weather = cityObjects[1].weather;
    cityObjects[1].weather = cityObjects[2].weather;

    // smoothen transition between city images where possible
    if (!document.startViewTransition) {
        applyStyles(); 
    } else {
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
    DOM.higherButton.disabled = false;
    DOM.lowerButton.disabled = false;
}

// binary search approach utilizing cumulativeWeights
function getWeightedRandomCity() {

    const target = Math.random() * gameStates.totalWeight;
    let low = 0;
    let high = gameStates.cumulativeWeights.length - 1;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (gameStates.cumulativeWeights[mid] < target) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return gameStates.cities[low];
}

/* ================================================================================================
                                                 UI
=================================================================================================*/

function applyTemperature() {

    if(cityObjects[0].weather) {
        DOM.leftTemperature.innerHTML = `${formatTemperature(cityObjects[0].weather.temperature)}°${gameStates.temperatureUnit}`;
    } else {
        DOM.leftTemperature.innerHTML = `--.--°${gameStates.temperatureUnit}`;
    }
}

function applyElevation() {

    if(cityObjects[0].weather && cityObjects[0].weather.elevation !== null) {
        DOM.leftElevation.innerHTML = `${formatElevation(cityObjects[0].weather.elevation)}${gameStates.heightUnit}`
        DOM.rightElevation.innerHTML = `${formatElevation(cityObjects[1].weather.elevation)}${gameStates.heightUnit}`
    } else {
        DOM.leftElevation.innerHTML = `<i>?</i> ${gameStates.heightUnit}`
        DOM.rightElevation.innerHTML = `<i>?</i> ${gameStates.heightUnit}`
    }
}

function applyStyles() {

    DOM.currentScore.innerHTML = gameStates.score;
    DOM.highscore.innerHTML = gameStates.highscore;
    
    // change UI strings to match cities
    DOM.leftCityString.innerHTML = `${cityObjects[0].city.city_ascii}, ${cityObjects[0].city.country}'s`;
    DOM.rightCityString.innerHTML = `${cityObjects[1].city.city_ascii}, ${cityObjects[1].city.country}'s`;
    DOM.leftCityStringRight.innerHTML = `than ${cityObjects[0].city.city_ascii}'s current temperature`;

    // change background images to match cities
    // change photography accreditation to match image
    if (cityObjects[0].images && cityObjects[0].images.length > 0) {
        DOM.leftSide.style.backgroundImage = `url('${cityObjects[0].images[0].url}')`;
        DOM.leftCopyright.href = cityObjects[0].images[0].photographerLink;
        DOM.leftCopyright.innerText = cityObjects[0].images[0].photographer;
        DOM.photoCreditLeft.innerHTML = "<i>provided by Pexels</i>"
    } else {
        DOM.leftSide.style.backgroundImage = `url(https://placehold.co/1920x1080?text=?)`;
        DOM.leftCopyright.href = "";
        DOM.leftCopyright.innerText = "";
        DOM.photoCreditLeft.innerHTML = ""
    }

    if (cityObjects[1].images && cityObjects[1].images.length > 0) {
        DOM.rightSide.style.backgroundImage = `url('${cityObjects[1].images[0].url}')`;
        DOM.rightCopyright.href = cityObjects[1].images[0].photographerLink;
        DOM.rightCopyright.innerText = cityObjects[1].images[0].photographer;
        DOM.photoCreditRight.innerHTML = "<i>provided by Pexels</i>"
    } else {
        DOM.rightSide.style.backgroundImage = `url(https://placehold.co/1920x1080?text=?)`;
        DOM.rightCopyright.href = "";
        DOM.rightCopyright.innerText = "";
        DOM.photoCreditRight.innerHTML = "";
    }

    applyTemperature();
    applyElevation();

    DOM.leftEmoji.innerHTML = formatEmoji(cityObjects[0].city);
    DOM.rightEmoji.innerHTML = formatEmoji(cityObjects[1].city);
}

// start game
init();

})();