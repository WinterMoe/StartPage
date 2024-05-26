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

function cookiesAllowed() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; cookiesAccepted=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        return cookieValue === 'true';
    }
    return false;
}

const cookieConsent = document.getElementById('cookie-consent');
const acceptCookies = document.getElementById('accept-cookies');
const denyCookies = document.getElementById('deny-cookies');

acceptCookies.addEventListener('click', () => {
    document.cookie = 'cookiesAccepted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
    cookieConsent.style.display = 'none';
    initializeSettings();
});

denyCookies.addEventListener('click', () => {
    document.cookie = 'cookiesAccepted=false; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
    cookieConsent.style.display = 'none';
});

function setCookie(name, value, days) {
    if (!cookiesAllowed()) {
        console.log('Cookies not allowed, not setting cookie:', name);
        return;
    }

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
    if (!cookiesAllowed()) {
        console.log('Cookies not allowed, not getting cookie:', name);
        return null;
    }

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

function initializeCookieConsent() {
    const cookiesAccepted = getCookie('cookiesAccepted');
    if (cookiesAccepted === "" || cookiesAccepted === null) {
        cookieConsent.style.display = 'block';
    } else {
        cookieConsent.style.display = 'none';
        initializeSettings();
    }
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
    const timeOptions = { hour: 'numeric', minute: 'numeric',  timeZone: 'America/New_York' };
    const date = now.toLocaleDateString('en-US', dateOptions);
    const time = now.toLocaleString('en-US', timeOptions);
    const formattedDateTime = `${date} ${time}`;
    document.getElementById('datetime').textContent = formattedDateTime;
    console.log("Date and time updated locally to:", formattedDateTime);

    setTimeout(updateDateTimeLocal, 1000 - now.getMilliseconds());
}


function updateWeather() {
    const apiKey = getCookie('openWeatherMapApiKey');
    const cityId = getCookie('cityId');

    if (!apiKey || !cityId) {
        document.getElementById('weather').textContent = "";
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=imperial`)
        .then(response => response.json())
        .then(data => {
            const weatherDescription = data.weather[0].description;
            const temperature = Math.round(data.main.temp);
            const city = data.name;
			
            document.getElementById('weather').textContent = `${temperature}°F`;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('weather').textContent = "Error fetching weather data.";
        });
}

function changeSearchEngine() {
    const searchForm = document.getElementById('search-form');
    const selectedEngine = document.getElementById('search-engine-select').value;

    const searchEngines = {
        google: 'https://www.google.com/search',
        bing: 'https://www.bing.com/search',
        duckduckgo: 'https://duckduckgo.com/',
        startpage: 'https://www.startpage.com/do/dsearch',
        qwant: 'https://www.qwant.com/',
        perplexity: 'https://www.perplexity.ai/search'
    };

    searchForm.action = searchEngines[selectedEngine];
    setCookie("searchEngine", selectedEngine, 365);
}

function saveSettings() {
    const apiKey = document.getElementById('api-key-input').value;
    const cityId = document.getElementById('city-id-input').value;
    setCookie("openWeatherMapApiKey", apiKey, 365);
    setCookie("cityId", cityId, 365);
	
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


function showCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.classList.toggle('show');
    updateCalendar(new Date());
}

function hideCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.classList.remove('show');
}

function updateCalendar(date) {
    const currentDate = new Date();
    const calendarBody = document.getElementById('calendar-body');
    const calendarMonth = document.getElementById('calendar-month');
    const year = date.getFullYear();
    const month = date.getMonth();
    
    calendarBody.innerHTML = '';

    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    calendarMonth.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    let row = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let date = 1; date <= lastDate; date++) {
        if (row.children.length === 7) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }

    const cell = document.createElement('td');
        cell.textContent = date;
        cell.className = 'bg-info';
		    
	const cellDate = new Date(year, month, date);
    if (cellDate.toDateString() === currentDate.toDateString()) {
        cell.classList.add('current-day');
    }
	
	document.addEventListener('click', (event) => {
		const calendar = document.getElementById('calendar');
		const isClickInside = calendar.contains(event.target);
			if (!isClickInside && event.target.id !== 'datetime') {
        hideCalendar(event);
    }
});
        row.appendChild(cell);
    }

    while (row.children.length < 7) {
        row.appendChild(document.createElement('td'));
    }
    calendarBody.appendChild(row);

}

let currentDate = new Date();

function initializeSettings() {
    const backgroundFolder = getCookie('backgroundFolder');
    if (backgroundFolder) {
        document.getElementById('background-select').value = backgroundFolder;
        changeBackground();
    }

    const searchEngine = getCookie('searchEngine');
    if (searchEngine) {
        document.getElementById('search-engine-select').value = searchEngine;
        changeSearchEngine();
    }

    const apiKey = getCookie('openWeatherMapApiKey');
    const cityId = getCookie('cityId');
    if (apiKey && cityId) {
        document.getElementById('api-key-input').value = apiKey;
        document.getElementById('city-id-input').value = cityId;
        updateWeather();
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

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar(currentDate);
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar(currentDate);
}


document.addEventListener('DOMContentLoaded', () => {
	changeBackground();
	updateDateTimeLocal();
    initializeCookieConsent();
	
    
		const now = new Date();
		const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
			setTimeout(() => {
				setInterval(updateDateTimeLocal, 60000);
			}, delay);
			
	updateWeather();

    document.getElementById('datetime').addEventListener('click', showCalendar);
    document.addEventListener('click', (event) => {
        const calendar = document.getElementById('calendar');
        const isClickInside = calendar.contains(event.target);
        if (!isClickInside && event.target.id !== 'datetime') {
            hideCalendar();
        }
    });

    document.querySelectorAll('.calendar-body td').forEach(dateCell => {
        dateCell.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
});
