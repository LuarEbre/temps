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

function init() {
    initializeCopyright();
    initializeEventListeners();
    fadeIn();
}

function generateNewImage() {
    // needs to return a new random image from Vexels API, as well as the Copyright Information
    return null;
}

init();