const animeImages = [
    'background1.jpg',
    'background2.jpg',
    'background3.jpg',
    'background4.jpg',
    'background5.jpg',
    'background6.jpg',
    'background7.jpg',
    'background8.jpg',
    'background9.jpg',
    'background10.jpg'
];

const environmentImages = [
    'background1.jpg',
    'background2.jpg',
    'background3.jpg',
    'background4.jpg',
    'background5.jpg',
    'background6.jpg',
    'background7.jpg',
    'background8.jpg',
    'background9.jpg',
    'background10.jpg'
];

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    let cookieString = `${name}=${value};${expires};path=/;`;

    if (location.protocol === 'https:') {
        cookieString += 'SameSite=None;Secure;';
    } else {
        cookieString += 'SameSite=Lax;';
    }

    document.cookie = cookieString;
    console.log(`Cookie set: ${name}=${value}`);
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

function getRandomBackgroundImage(folder) {
    console.log("Selecting random background image from folder:", folder);
    const images = folder === 'anime' ? animeImages : environmentImages;
    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = `images/${folder}/${images[randomIndex]}`;
    console.log("Selected image:", selectedImage);
    return selectedImage;
}

function changeBackground() {
    const folder = document.getElementById('background-select').value;
    const randomBackgroundImage = getRandomBackgroundImage(folder);
    document.body.style.backgroundImage = `url(${randomBackgroundImage})`;
    setCookie("backgroundFolder", folder, 365);
    console.log("Background changed to:", randomBackgroundImage);
}

function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    const cog = document.getElementById('settings-cog');

    cog.classList.add('spin');

    cog.addEventListener('animationend', () => {
        cog.classList.remove('spin');
    });

    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
    } else {
        setTimeout(() => {
            menu.classList.add('show');
        }, 100);
    }
}

function updateDateTimeLocal() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' };
    const date = now.toLocaleDateString('en-US', dateOptions);
    const time = now.toLocaleTimeString('en-US', timeOptions);
    const formattedDateTime = `${date} ${time}`;
    document.getElementById('datetime').textContent = formattedDateTime;
    console.log("Date and time updated locally to:", formattedDateTime);
}

async function updateWeather() {
    const apiKey = getCookie('apiKey');
    const cityId = getCookie('cityId');

    if (!apiKey || !cityId) {
        document.getElementById('weather').textContent = 'N/A';
        console.log("API Key or City ID not set.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const temperature = Math.round(data.main.temp);
        document.getElementById('weather').textContent = `${temperature}°F`;
        console.log("Weather updated to:", `${temperature}°F`);
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('weather').textContent = 'N/A';
    }
}

function changeSearchEngine() {
    const searchEngine = document.getElementById('search-engine-select').value;
    const searchForm = document.getElementById('search-form');
    switch (searchEngine) {
        case 'google':
            searchForm.action = 'https://www.google.com/search?q=';
            break;
        case 'bing':
            searchForm.action = 'https://www.bing.com/search?q=';
            break;
        case 'duckduckgo':
            searchForm.action = 'https://duckduckgo.com/?q=';
            break;
        case 'startpage':
            searchForm.action = 'https://www.startpage.com/sp/search?q=';
            break;
        case 'qwant':
            searchForm.action = 'https://www.qwant.com/?q=';
            break;
        case 'yandex':
            searchForm.action = 'https://yandex.com/search/?text=';
            break;
        case 'perplexity':
            searchForm.action = 'https://www.perplexity.ai/search?q=';
            break;
    }
    setCookie('searchEngine', searchEngine, 365);
    console.log("Search engine changed to:", searchEngine);
}

function saveSettings() {
    const apiKey = document.getElementById('api-key-input').value;
    const cityId = document.getElementById('city-id-input').value;
    const searchEngine = document.getElementById('search-engine-select').value;

    setCookie('apiKey', apiKey, 365);
    setCookie('cityId', cityId, 365);
    setCookie('searchEngine', searchEngine, 365);

    const linkNumber = document.getElementById('link-number-select').value;
    const linkText = document.getElementById('link-text-input').value;
    const linkUrl = document.getElementById('link-url-input').value;

    if (linkText && linkUrl) {
        const link = document.querySelectorAll('.links a')[linkNumber];
        link.textContent = linkText;
        link.href = linkUrl;

        setCookie(`linkText${linkNumber}`, linkText, 365);
        setCookie(`linkUrl${linkNumber}`, linkUrl, 365);

        const linkOption = document.querySelector(`#link-number-select option[value="${linkNumber}"]`);
        linkOption.textContent = linkText;
    }

    alert('Settings saved!');
    console.log('Settings have been saved.');
}

function initializeSettings() {
    const backgroundFolder = getCookie("backgroundFolder");
    if (backgroundFolder) {
        document.getElementById('background-select').value = backgroundFolder;
        changeBackground();
    }

    const apiKey = getCookie('apiKey');
    if (apiKey) {
        document.getElementById('api-key-input').value = apiKey;
    }

    const cityId = getCookie('cityId');
    if (cityId) {
        document.getElementById('city-id-input').value = cityId;
    }

    const searchEngine = getCookie('searchEngine');
    if (searchEngine) {
        document.getElementById('search-engine-select').value = searchEngine;
        changeSearchEngine();
    }

    const linkSelect = document.getElementById('link-number-select');
    const links = document.querySelectorAll('.links a');
    links.forEach((link, index) => {
        const linkText = getCookie(`linkText${index}`);
        const linkUrl = getCookie(`linkUrl${index}`);
        if (linkText && linkUrl) {
            link.textContent = linkText;
            link.href = linkUrl;
        }

        const option = document.createElement('option');
        option.value = index;
        option.textContent = link.textContent;
        linkSelect.appendChild(option);
        console.log(`Link ${index} initialized: ${link.textContent} (${link.href})`);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initializeSettings();
    updateDateTimeLocal();
    updateWeather();
    setInterval(updateDateTimeLocal, 60000);
    setInterval(updateWeather, 600000);
});
