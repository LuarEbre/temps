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

function generateNewImage() {
    // needs to return a new random image from Vexels API, as well as the Copyright Information
    return null;
}

init();

let allCities = [];
let cumulativeWeights = [];
let totalWeight = 0;
let city1 = null;
let city2 = null;

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

function drawTwoRandomCities() {
    city1 = getWeightedRandomCity();
    city2 = getWeightedRandomCity();

    while (city1.id === city2.id) {
        city2 = getWeightedRandomCity();
    }

    document.getElementById("left-city").innerHTML = `${city1.city_ascii}, ${city1.country}'s`;
    document.getElementById("right-city").innerHTML = `${city2.city_ascii}, ${city2.country}'s`;
    document.getElementById("left-city-2").innerHTML = `than ${city1.city_ascii}'s current temperature`;
}