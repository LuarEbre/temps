# temps

[![Netlify Status](https://api.netlify.com/api/v1/badges/3ae7aae7-f874-4c72-a387-729a31ffe2de/deploy-status)](https://app.netlify.com/projects/temps-game/deploys)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css&logoColor=white)

<p align="center">
  <img src="Images/Logo/temps_light.png#gh-light-mode-only" width="550" alt="Temps Logo Light"/>
  <img src="Images/Logo/temps.png#gh-dark-mode-only" width="550" alt="Temps Logo Dark"/>
</p>

> **temps** > */ tɑ̃ /* • *noun, fr.*
> 1. weather.
> 2. short for *temperatures*.

### A global game of higher or lower, driven by the live, unpredictable weather of Earth.

Because the data is fetched in real-time, the game is never the same twice. <br> The time of day, the season, and the rotation of the Earth all actively rewrite the rules of the game while you play. 

### **[Play temps!](https://temps-game.netlify.app)**

## How to Play

1. You are presented with 2 cities
2. A simple question is asked; "Does City Y have a **higher ↑** or **lower ↓** temperature than City X?"
3. Use your geography knowledge, as well as the elevation, & current time, which are overlaid on screen, to determine a guess
4. Guess!
5. If you're correct, your goal is to continue the streak, if you're wrong, you must try again

## Features

**Real-Time Data:**
* Temperatures & elevation are fetched live, meaning the game changes depending on the time of day and season.

**Global Scope:**
* Features a dataset of ~50,000 cities across 248 countries and territories, with a slight edge for "nicher" locations.

**Metric & Imperial Units**
* Allows for switching from *°C* to *°F* and from *meters* to *feet*.

**Highscore:**
* Keep track of your highest score across sessions.

## Built With
**Frontend:**
* HTML5
* CSS3
* Vanilla JavaScript

**Backend:** 
* Node.js

**Deployment:** 
* Netlify

**Data & APIs:**
* [SimpleMaps](https://simplemaps.com/data/world-cities) – city dataset
* [Pexels](https://www.pexels.com/api/) – dynamic background photos based on location
* [OpenWeather](https://openweathermap.org/api) – temperature & timezone fetching
* [OpenMeteo](https://open-meteo.com/) – elevation fetching