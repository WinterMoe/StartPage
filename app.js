// StartPage - Main Application
document.addEventListener('DOMContentLoaded', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // Storage Keys & Initial Data
  // ═══════════════════════════════════════════════════════════════════════════
  const SETTINGS_KEY = 'sp_settings';
  const IMAGES_KEY = 'sp_images';
  const BANNERS_KEY = 'sp_banners';
  const TASKS_KEY = 'sp_tasks';
  const NOTES_KEY = 'sp_notes';

  // ─── Storage Functions ─────────────────────────────────────────────────────
  function loadSettings() {
    try {
      const lsData = localStorage.getItem(SETTINGS_KEY);
      if (lsData) return JSON.parse(lsData);
      const cookieData = getCookie(SETTINGS_KEY);
      if (cookieData) return JSON.parse(cookieData);
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return {};
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setCookie(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  function loadData(key, defaultValue = '[]') {
    try {
      const lsData = localStorage.getItem(key);
      if (lsData) return JSON.parse(lsData);
      const cookieData = getCookie(key);
      if (cookieData) return JSON.parse(cookieData);
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
    }
    return JSON.parse(defaultValue);
  }

  function saveData(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      if (jsonData.length < 4000) {
        setCookie(key, jsonData);
      }
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }

  // ─── Initial State ─────────────────────────────────────────────────────────
  let settings = loadSettings();
  let images = loadData(IMAGES_KEY);
  let banners = loadData(BANNERS_KEY);
  const DEFAULT_BANNER = 'images/banner.webp';

  // Migrate old task format (strings) to new format (objects)
  let tasks = loadData(TASKS_KEY);
  if (tasks.length > 0 && typeof tasks[0] === 'string') {
    tasks = tasks.map(text => ({ text, completed: false }));
    saveData(TASKS_KEY, tasks);
  }

  // Default background pools
  let calendarEvents = {};
  const defaultBackgrounds = {
    environment: Array.from({ length: 10 }, (_, i) => `images/environment/background${i + 1}.jpg`),
    anime: Array.from({ length: 10 }, (_, i) => `images/anime/background${i + 1}.jpg`)
  };

  // Quick links data (mutable for customization)
  const linksData = [
    { text: 'youtube', url: 'https://www.youtube.com' },
    { text: 'twitter', url: 'https://twitter.com' },
    { text: 'reddit', url: 'https://www.reddit.com' },
    { text: 'pmail', url: 'https://protonmail.com' },
    { text: 'gmail', url: 'https://mail.google.com' },
    { text: 'github', url: 'https://github.com' },
    { text: '4chan', url: 'https://www.4chan.org' },
    { text: 'light novels', url: 'https://www.novelupdates.com/' },
    { text: 'notion', url: 'https://www.notion.so' }
  ];

  // Load saved links if available
  const savedLinks = loadData('sp_links', 'null');
  if (savedLinks) {
    savedLinks.forEach((link, i) => {
      if (linksData[i]) {
        linksData[i].text = link.text;
        linksData[i].url = link.url;
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DOM References
  // ═══════════════════════════════════════════════════════════════════════════
  const mainUi = document.getElementById('main-ui');
  const settingsPanel = document.getElementById('settings-panel');
  const cog = document.getElementById('settings-cog');
  const saveBtn = document.getElementById('save-settings-btn');
  const saveMsg = document.getElementById('save-message');

  const bgSelect = document.getElementById('background-select');
  const colorWrap = document.getElementById('bg-color-picker-container');
  const colorInput = document.getElementById('bg-color-input');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('image-upload');
  const fileName = document.getElementById('file-name-display');
  const imgGrid = document.getElementById('uploaded-images-grid');

  const accentIn = document.getElementById('accent-color-input');
  const engineSel = document.getElementById('search-engine-select');
  const apiKeyIn = document.getElementById('api-key-input');
  const cityIdIn = document.getElementById('city-id-input');
  const icsUrlIn = document.getElementById('ics-url-input');
  const linkNum = document.getElementById('link-number-select');
  const linkText = document.getElementById('link-text-input');
  const linkUrl = document.getElementById('link-url-input');

  const settingsTaskToggle = document.getElementById('settings-tasklist-toggle');
  const settingsNotesToggle = document.getElementById('settings-notes-toggle');
  const settingsClockToggle = document.getElementById('settings-clock24-toggle');
  const settingsSecondsToggle = document.getElementById('settings-seconds-toggle');
  const settingsBannerToggle = document.getElementById('settings-banner-toggle');
  const settingsLightModeToggle = document.getElementById('settings-lightmode-toggle');
  const settingsAnimatedBgToggle = document.getElementById('settings-animatedbg-toggle');

  const taskToggle = document.getElementById('task-list-toggle');
  const tasksPanel = document.getElementById('tasks-panel');
  const tasksList = document.getElementById('tasks-list');
  const newTaskIn = document.getElementById('new-task-input');
  const newTaskDate = document.getElementById('new-task-date');
  const addTaskBtn = document.getElementById('add-task-btn');

  const notesSection = document.querySelector('.notes-section');
  const notesInput = document.getElementById('notes-input');

  const bannerImg = document.getElementById('banner');
  const bannerUploadBtn = document.getElementById('banner-upload-btn');
  const bannerFileInput = document.getElementById('banner-upload');
  const bannerFileName = document.getElementById('banner-file-name');
  const bannerGrid = document.getElementById('banner-images-grid');
  const resetBannerBtn = document.getElementById('reset-banner-btn');

  const calendarEl = document.getElementById('calendar');
  const datetimeEl = document.getElementById('datetime');
  const searchInput = document.getElementById('search-input');
  const eventCountdownEl = document.getElementById('event-countdown');
  const animatedBgEl = document.getElementById('animated-bg');
  const addIcsBtn = document.getElementById('add-ics-btn');
  const icsFeedsList = document.getElementById('ics-feeds-list');

  // ═══════════════════════════════════════════════════════════════════════════
  // Keyboard Shortcuts
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    // "/" focuses search (unless already typing)
    if (e.key === '/' && !isTyping) {
      e.preventDefault();
      searchInput.focus();
    }

    // "Escape" closes panels
    if (e.key === 'Escape') {
      // Close settings panel
      if (!settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.add('hidden');
        mainUi.classList.remove('hidden');
        return;
      }
      // Close calendar
      if (calendarEl.classList.contains('show')) {
        calendarEl.classList.remove('show');
        calendarEl.setAttribute('aria-hidden', 'true');
        return;
      }
      // Close tasks panel
      if (tasksPanel.classList.contains('show')) {
        tasksPanel.classList.remove('show');
        tasksPanel.setAttribute('aria-hidden', 'true');
        taskToggle.setAttribute('aria-expanded', 'false');
        return;
      }
      // Blur search if focused
      if (document.activeElement === searchInput) {
        searchInput.blur();
      }
    }
  });

  // Settings cog keyboard support
  cog.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cog.click();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UI Helper Functions
  // ═══════════════════════════════════════════════════════════════════════════
  function applyBackground() {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
    if (settings.folder === 'solid' && settings.bgColor) {
      document.body.style.backgroundColor = settings.bgColor;
    } else if (settings.folder === 'custom' && settings.bg) {
      document.body.style.backgroundImage = `url("${settings.bg}")`;
    } else {
      const pool = defaultBackgrounds[settings.folder || 'environment'];
      if (pool && pool.length) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        document.body.style.backgroundImage = `url("${pick}")`;
      }
    }
  }

  function applyAccentColor() {
    const color = settings.color || '#b8acf0';
    document.documentElement.style.setProperty('--accent-color', color);
    // Calculate hover color (slightly darker)
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const hoverColor = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
    document.documentElement.style.setProperty('--accent-hover', hoverColor);
    // Glow effect
    document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
  }

  function applyTaskListSetting() {
    const visible = settings.tasksEnabled === true;
    taskToggle.style.display = visible ? 'block' : 'none';
    if (!visible) {
      tasksPanel.classList.remove('show');
      tasksPanel.setAttribute('aria-hidden', 'true');
    }
  }

  function applyNotesSetting() {
    const visible = settings.notesEnabled === true;
    notesSection.style.display = visible ? 'block' : 'none';
  }

  function applyBannerSetting() {
    const show = settings.bannerEnabled !== false;
    if (show) {
      bannerImg.removeAttribute('hidden');
      // Apply custom banner if available, cycling randomly
      if (banners.length > 0) {
        const randomBanner = banners[Math.floor(Math.random() * banners.length)];
        bannerImg.src = randomBanner;
      } else {
        bannerImg.src = DEFAULT_BANNER;
      }
    } else {
      bannerImg.setAttribute('hidden', '');
    }
  }

  // Refresh banner grid in settings
  function refreshBannerGrid() {
    if (!bannerGrid) return;
    bannerGrid.innerHTML = banners.map((src, i) => `
      <div>
        <img src="${src}" alt="Banner ${i + 1}">
        <button data-index="${i}" aria-label="Remove banner ${i + 1}">×</button>
      </div>
    `).join('');
    bannerGrid.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        banners.splice(+b.dataset.index, 1);
        saveData(BANNERS_KEY, banners);
        refreshBannerGrid();
      });
    });
  }

  // Light/Dark theme
  function applyTheme() {
    if (settings.lightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Animated background
  function applyAnimatedBg() {
    if (animatedBgEl) {
      if (settings.animatedBg) {
        animatedBgEl.classList.remove('disabled');
      } else {
        animatedBgEl.classList.add('disabled');
      }
    }
  }

  // ICS feeds list (multiple feeds support)
  function refreshIcsFeedsList() {
    if (!icsFeedsList) return;
    const feeds = settings.icsFeeds || [];
    if (feeds.length === 0) {
      icsFeedsList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85em;">No calendar feeds added</div>';
      return;
    }
    icsFeedsList.innerHTML = feeds.map((url, i) => {
      // Show shortened URL
      let displayUrl = url;
      try {
        const parsed = new URL(url);
        displayUrl = parsed.hostname + parsed.pathname.slice(0, 30) + '...';
      } catch (e) {
        displayUrl = url.slice(0, 40) + '...';
      }
      return `
        <div class="ics-feed-item">
          <span title="${url}">${displayUrl}</span>
          <button data-index="${i}" aria-label="Remove feed">×</button>
        </div>
      `;
    }).join('');
    icsFeedsList.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        settings.icsFeeds.splice(+b.dataset.index, 1);
        saveSettings(settings);
        refreshIcsFeedsList();
        fetchAllICSEvents();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Quick Links
  // ═══════════════════════════════════════════════════════════════════════════
  (function initLinks() {
    const lc = document.querySelector('.links');
    linksData.forEach(ln => {
      const a = document.createElement('a');
      a.href = ln.url;
      a.textContent = ln.text;
      lc.appendChild(a);
    });
    linkNum.innerHTML = linksData.map((ln, i) =>
      `<option value="${i}">${ln.text}</option>`
    ).join('');
    linkNum.addEventListener('change', () => {
      const idx = +linkNum.value;
      linkText.value = linksData[idx].text;
      linkUrl.value = linksData[idx].url;
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // Clock Display
  // ═══════════════════════════════════════════════════════════════════════════
  (function initClock() {
    const dt = document.getElementById('datetime');
    function update() {
      const now = new Date();
      const dateStr = now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const opts = { hour: 'numeric', minute: '2-digit', hour12: !settings.clock24 };
      if (settings.showSeconds) opts.second = '2-digit';
      const timeStr = now.toLocaleTimeString([], opts);
      dt.textContent = `${dateStr}  •  ${timeStr}`;

      // Update event countdown periodically (every second is fine)
      if (typeof updateEventCountdown === 'function') {
        updateEventCountdown();
      }
    }
    update();
    setInterval(update, 1000);
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // Weather Widget
  // ═══════════════════════════════════════════════════════════════════════════
  async function updateWeather() {
    const weatherEl = document.getElementById('weather');

    if (!settings.apiKey || !settings.cityId) {
      weatherEl.textContent = '';
      return;
    }

    weatherEl.textContent = 'Loading...';
    weatherEl.classList.add('weather-loading');

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?id=${settings.cityId}` +
        `&appid=${settings.apiKey}&units=metric`
      );

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      weatherEl.classList.remove('weather-loading');
      weatherEl.textContent = `${data.weather[0].main} ${Math.round(data.main.temp)}°C`;
    } catch (err) {
      weatherEl.classList.remove('weather-loading');
      weatherEl.classList.add('weather-error');
      weatherEl.textContent = 'Weather unavailable';
      console.warn('Weather fetch failed:', err);
    }
  }
  updateWeather();

  // ═══════════════════════════════════════════════════════════════════════════
  // Search Form
  // ═══════════════════════════════════════════════════════════════════════════
  document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    const engines = {
      google: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      startpage: `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
      qwant: `https://www.qwant.com/?q=${encodeURIComponent(q)}`,
      perplexity: `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`
    };
    window.location.href = engines[settings.engine || 'google'];
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Calendar with ICS Support
  // ═══════════════════════════════════════════════════════════════════════════

  // ICS event storage - indexed by date string (YYYY-MM-DD)
  // calendarEvents is defined at the top of the file

  // ICS Parser - parses VEVENT entries from ICS data
  function parseICS(icsData) {
    const events = {};
    const lines = icsData.replace(/\r\n /g, '').split(/\r?\n/);
    let currentEvent = null;

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.start) {
          // Get date key (YYYY-MM-DD)
          const dateKey = currentEvent.start.slice(0, 10);
          if (!events[dateKey]) events[dateKey] = [];
          events[dateKey].push({
            summary: currentEvent.summary || 'Untitled Event',
            start: currentEvent.start,
            end: currentEvent.end,
            allDay: currentEvent.allDay || false
          });
        }
        currentEvent = null;
      } else if (currentEvent) {
        // Parse DTSTART
        if (line.startsWith('DTSTART')) {
          const value = line.split(':').pop();
          currentEvent.start = parseICSDate(value);
          currentEvent.allDay = !value.includes('T');
        }
        // Parse DTEND
        if (line.startsWith('DTEND')) {
          const value = line.split(':').pop();
          currentEvent.end = parseICSDate(value);
        }
        // Parse SUMMARY
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';');
        }
      }
    }
    return events;
  }

  // Parse ICS date format (20231225 or 20231225T140000Z)
  function parseICSDate(icsDate) {
    if (!icsDate) return null;
    // Remove any timezone suffix and parse
    const clean = icsDate.replace('Z', '');
    if (clean.length === 8) {
      // Date only: YYYYMMDD
      return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
    } else if (clean.length >= 15) {
      // DateTime: YYYYMMDDTHHMMSS
      return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T${clean.slice(9, 11)}:${clean.slice(11, 13)}`;
    }
    return clean;
  }



  // Fetch all ICS feeds and merge events
  async function fetchAllICSEvents() {
    const feeds = settings.icsFeeds || [];
    // Also support legacy single icsUrl
    if (settings.icsUrl && !feeds.includes(settings.icsUrl)) {
      feeds.push(settings.icsUrl);
    }

    if (feeds.length === 0) {
      calendarEvents = {};
      updateEventCountdown();
      return;
    }

    calendarEvents = {};

    for (const url of feeds) {
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) continue;

        const icsData = await response.text();
        const events = parseICS(icsData);

        // Merge events
        for (const [dateKey, dayEvents] of Object.entries(events)) {
          if (!calendarEvents[dateKey]) calendarEvents[dateKey] = [];
          calendarEvents[dateKey].push(...dayEvents);
        }
      } catch (err) {
        console.warn('Failed to fetch ICS:', url, err);
      }
    }

    // Rebuild calendar and update countdown
    if (typeof rebuildCalendar === 'function') {
      rebuildCalendar();
    }
    updateEventCountdown();
  }

  // Update event countdown display
  function updateEventCountdown() {
    if (!eventCountdownEl) return;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    let nextEvent = null;
    let nextEventDate = null;

    // Find the next upcoming event
    const sortedDates = Object.keys(calendarEvents).sort();
    for (const dateKey of sortedDates) {
      if (dateKey >= today) {
        const dayEvents = calendarEvents[dateKey];
        for (const evt of dayEvents) {
          const evtDate = new Date(evt.start || dateKey);
          if (evtDate > now || dateKey > today) {
            if (!nextEventDate || evtDate < nextEventDate) {
              nextEvent = evt;
              nextEventDate = evtDate;
            }
          }
        }
        if (nextEvent) break;
      }
    }

    if (!nextEvent) {
      eventCountdownEl.innerHTML = '';
      return;
    }

    // Calculate countdown
    const diff = nextEventDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let countdownText = '';
    if (days > 0) {
      countdownText = `${days}d ${hours}h`;
    } else if (hours > 0) {
      countdownText = `${hours}h`;
    } else {
      countdownText = 'Soon';
    }

    const eventName = nextEvent.summary.length > 20 ? nextEvent.summary.slice(0, 18) + '…' : nextEvent.summary;
    eventCountdownEl.innerHTML = `${eventName}: <span class="countdown-time">${countdownText}</span>`;
  }

  // Initialize calendar
  (function initCalendar() {
    let cur = new Date();
    const tbody = document.getElementById('calendar-body');
    const monthSpan = document.getElementById('calendar-month');
    const eventPopup = document.getElementById('event-popup');
    const eventPopupTitle = document.getElementById('event-popup-title');
    const eventPopupList = document.getElementById('event-popup-list');

    function build(d) {
      tbody.innerHTML = '';
      eventPopup.classList.add('hidden');
      monthSpan.textContent = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      const y = d.getFullYear(), m = d.getMonth();
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const today = new Date();

      let row = document.createElement('tr');
      for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
      }
      for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
          tbody.appendChild(row);
          row = document.createElement('tr');
        }
        const cell = document.createElement('td');
        cell.textContent = day;
        cell.setAttribute('role', 'gridcell');

        // Check if this day has events
        const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = calendarEvents[dateKey];

        if (dayEvents && dayEvents.length > 0) {
          cell.classList.add('has-events');
          cell.setAttribute('data-date', dateKey);
          cell.setAttribute('title', `${dayEvents.length} event(s)`);

          // Click handler to show events
          cell.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventPopup(dateKey, dayEvents);
          });
        }

        if (day === today.getDate() && m === today.getMonth() && y === today.getFullYear()) {
          cell.classList.add('current-day');
          cell.setAttribute('aria-current', 'date');
        }
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }

    function showEventPopup(dateKey, events) {
      const date = new Date(dateKey + 'T12:00:00');
      eventPopupTitle.textContent = date.toLocaleDateString('default', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      eventPopupList.innerHTML = events.map(event => {
        let timeStr = '';
        if (!event.allDay && event.start && event.start.includes('T')) {
          const time = event.start.split('T')[1];
          if (time) {
            const [h, m] = time.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            timeStr = `${hour12}:${m} ${ampm}`;
          }
        } else {
          timeStr = 'All day';
        }
        return `<li>
          <strong>${escapeHtml(event.summary)}</strong>
          <span class="event-time">${timeStr}</span>
        </li>`;
      }).join('');

      eventPopup.classList.remove('hidden');
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    document.getElementById('previous-month-btn').addEventListener('click', () => {
      cur.setMonth(cur.getMonth() - 1);
      build(cur);
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
      cur.setMonth(cur.getMonth() + 1);
      build(cur);
    });

    // Expose rebuild function for ICS updates
    window.rebuildCalendar = () => build(cur);

    build(cur);

    // Fetch ICS events on load
    fetchAllICSEvents();
  })();

  // Calendar toggle
  datetimeEl.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = calendarEl.classList.contains('show');
    if (isOpen) {
      calendarEl.classList.remove('show');
      calendarEl.setAttribute('aria-hidden', 'true');
    } else {
      calendarEl.classList.add('show');
      calendarEl.setAttribute('aria-hidden', 'false');
    }
  });

  document.addEventListener('click', e => {
    const eventPopup = document.getElementById('event-popup');
    if (!calendarEl.contains(e.target) && e.target !== datetimeEl) {
      calendarEl.classList.remove('show');
      calendarEl.setAttribute('aria-hidden', 'true');
    }
    // Close event popup if clicking outside
    if (eventPopup && !eventPopup.contains(e.target) && !e.target.classList.contains('has-events')) {
      eventPopup.classList.add('hidden');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Settings Panel
  // ═══════════════════════════════════════════════════════════════════════════
  function ensureCustomOption() {
    if (images.length && !bgSelect.querySelector('option[value="custom"]')) {
      const o = document.createElement('option');
      o.value = 'custom';
      o.textContent = 'Custom Upload';
      bgSelect.appendChild(o);
    }
  }

  function refreshImageGrid() {
    imgGrid.innerHTML = images.map((src, i) => `
      <div>
        <img src="${src}" alt="Background ${i + 1}">
        <button data-index="${i}" aria-label="Remove image ${i + 1}">×</button>
      </div>
    `).join('');
    imgGrid.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        images.splice(+b.dataset.index, 1);
        saveData(IMAGES_KEY, images);
        if (settings.folder === 'custom') {
          delete settings.bg;
          settings.folder = '';
        }
        refreshImageGrid();
        loadForm();
      });
    });
  }

  function loadForm() {
    ensureCustomOption();
    settings.folder = settings.folder || 'environment';
    bgSelect.value = settings.folder;
    colorWrap.style.display = settings.folder === 'solid' ? 'block' : 'none';
    if (settings.bgColor) colorInput.value = settings.bgColor;
    fileName.textContent = '';

    accentIn.value = settings.color || '#b8acf0';
    engineSel.value = settings.engine || 'google';
    apiKeyIn.value = settings.apiKey || '';
    cityIdIn.value = settings.cityId || '';
    linkNum.value = settings.linkNum || 0;
    settingsTaskToggle.checked = settings.tasksEnabled === true;
    settingsNotesToggle.checked = settings.notesEnabled === true;
    settingsClockToggle.checked = settings.clock24 === true;
    settingsSecondsToggle.checked = settings.showSeconds === true;
    settingsBannerToggle.checked = settings.bannerEnabled !== false;
    settingsLightModeToggle.checked = settings.lightMode === true;
    settingsAnimatedBgToggle.checked = settings.animatedBg === true;
    icsUrlIn.value = '';
    // Banner section
    if (bannerFileName) bannerFileName.textContent = '';
  }

  // Settings event handlers
  cog.addEventListener('click', () => {
    mainUi.classList.add('hidden');
    settingsPanel.classList.remove('hidden');
    loadForm();
  });

  // Click outside settings content to close (without saving)
  settingsPanel.addEventListener('click', (e) => {
    // Only close if clicking directly on the panel background, not on content inside
    if (e.target === settingsPanel) {
      settingsPanel.classList.add('hidden');
      mainUi.classList.remove('hidden');
    }
  });

  // Collapsible section toggles
  document.querySelectorAll('#settings-panel .collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('section.collapsible');
      if (section) {
        section.classList.toggle('collapsed');
      }
    });
  });

  saveBtn.addEventListener('click', () => {
    // Save links
    saveData('sp_links', linksData);
    saveSettings(settings);
    saveData(IMAGES_KEY, images);

    settingsPanel.classList.add('hidden');
    mainUi.classList.remove('hidden');
    applyBackground();
    applyAccentColor();
    applyTaskListSetting();
    applyNotesSetting();
    applyBannerSetting();
    applyTheme();
    applyAnimatedBg();
    updateWeather();

    // Re-fetch ICS events
    fetchAllICSEvents();

    saveMsg.textContent = 'Settings saved!';
    setTimeout(() => saveMsg.textContent = '', 2000);
  });

  settingsTaskToggle.addEventListener('change', () => {
    settings.tasksEnabled = settingsTaskToggle.checked;
    applyTaskListSetting();
  });

  settingsNotesToggle.addEventListener('change', () => {
    settings.notesEnabled = settingsNotesToggle.checked;
    applyNotesSetting();
  });

  settingsClockToggle.addEventListener('change', () => {
    settings.clock24 = settingsClockToggle.checked;
  });

  settingsSecondsToggle.addEventListener('change', () => {
    settings.showSeconds = settingsSecondsToggle.checked;
  });

  settingsBannerToggle.addEventListener('change', () => {
    settings.bannerEnabled = settingsBannerToggle.checked;
    applyBannerSetting();
  });

  settingsLightModeToggle.addEventListener('change', () => {
    settings.lightMode = settingsLightModeToggle.checked;
    applyTheme();
  });

  settingsAnimatedBgToggle.addEventListener('change', () => {
    settings.animatedBg = settingsAnimatedBgToggle.checked;
    applyAnimatedBg();
  });

  // Add ICS feed button
  if (addIcsBtn) {
    addIcsBtn.addEventListener('click', () => {
      const url = icsUrlIn.value.trim();
      if (!url) return;

      if (!settings.icsFeeds) settings.icsFeeds = [];
      if (!settings.icsFeeds.includes(url)) {
        settings.icsFeeds.push(url);
        saveSettings(settings);
        refreshIcsFeedsList();
        icsUrlIn.value = '';
        fetchAllICSEvents();
      }
    });
  }

  bgSelect.addEventListener('change', () => {
    settings.folder = bgSelect.value;
    colorWrap.style.display = settings.folder === 'solid' ? 'block' : 'none';
  });

  colorInput.addEventListener('change', () => {
    settings.bgColor = colorInput.value;
  });

  accentIn.addEventListener('change', () => {
    settings.color = accentIn.value;
    applyAccentColor();
  });

  engineSel.addEventListener('change', () => {
    settings.engine = engineSel.value;
  });

  apiKeyIn.addEventListener('change', () => {
    settings.apiKey = apiKeyIn.value;
  });

  cityIdIn.addEventListener('change', () => {
    settings.cityId = cityIdIn.value;
  });

  linkText.addEventListener('change', () => {
    const idx = +linkNum.value;
    linksData[idx].text = linkText.value;
    document.querySelectorAll('.links a')[idx].textContent = linkText.value;
  });

  linkUrl.addEventListener('change', () => {
    const idx = +linkNum.value;
    linksData[idx].url = linkUrl.value;
    document.querySelectorAll('.links a')[idx].href = linkUrl.value;
  });

  // File upload
  uploadBtn.addEventListener('click', () => fileInput.click());

  // Image compression helper
  function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  fileInput.addEventListener('change', async () => {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      fileName.textContent = 'Processing...';

      try {
        const imgSrc = await compressImage(file);
        fileName.textContent = file.name;
        images.push(imgSrc);
        settings.folder = 'custom';
        settings.bg = imgSrc;
        refreshImageGrid();
        ensureCustomOption();
        bgSelect.value = 'custom';
      } catch (e) {
        console.error('Image processing failed:', e);
        fileName.textContent = 'Error processing image';
      }
    }
  });

  // Banner upload
  if (bannerUploadBtn) {
    bannerUploadBtn.addEventListener('click', () => bannerFileInput.click());
  }

  if (bannerFileInput) {
    bannerFileInput.addEventListener('change', async () => {
      if (bannerFileInput.files && bannerFileInput.files[0]) {
        const file = bannerFileInput.files[0];
        if (bannerFileName) bannerFileName.textContent = 'Processing...';

        try {
          const imgSrc = await compressImage(file, 1200, 0.8); // Smaller width for banners
          if (bannerFileName) bannerFileName.textContent = file.name;
          banners.push(imgSrc);
          saveData(BANNERS_KEY, banners);
          refreshBannerGrid();
        } catch (e) {
          console.error('Banner processing failed:', e);
          if (bannerFileName) bannerFileName.textContent = 'Error processing image';
        }
      }
    });
  }

  if (resetBannerBtn) {
    resetBannerBtn.addEventListener('click', () => {
      banners = [];
      saveData(BANNERS_KEY, banners);
      refreshBannerGrid();
      bannerImg.src = DEFAULT_BANNER;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Notes
  // ═══════════════════════════════════════════════════════════════════════════
  notesInput.value = localStorage.getItem(NOTES_KEY) || getCookie(NOTES_KEY) || '';

  notesInput.addEventListener('input', () => {
    try {
      localStorage.setItem(NOTES_KEY, notesInput.value);
      if (notesInput.value.length < 4000) {
        setCookie(NOTES_KEY, notesInput.value);
      }
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Task List
  // ═══════════════════════════════════════════════════════════════════════════
  function renderTasks() {
    // Sort tasks: Incomplete first (by due date), then completed
    const sortedTasks = tasks.map((t, i) => ({ ...t, originalIndex: i })).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    tasksList.innerHTML = sortedTasks.map((task) => {
      let dateDisplay = '';
      let dateClass = 'task-due-date';
      let itemClass = '';

      if (task.dueDate) {
        if (task.dueDate < today) {
          itemClass = 'overdue';
          dateDisplay = 'Overdue';
        } else if (task.dueDate === today) {
          itemClass = 'due-soon';
          dateDisplay = 'Today';
        } else if (task.dueDate === tomorrowStr) {
          dateDisplay = 'Tomorrow';
        } else {
          dateDisplay = task.dueDate.slice(5).replace('-', '/');
        }
      }

      return `
      <div class="task-item ${task.completed ? 'completed' : ''} ${itemClass}" role="listitem">
        <input type="checkbox" 
               ${task.completed ? 'checked' : ''} 
               data-i="${task.originalIndex}" 
               aria-label="Mark task complete">
        <span>${escapeHtml(task.text)}</span>
        ${dateDisplay ? `<span class="${dateClass}">${dateDisplay}</span>` : ''}
        <button data-i="${task.originalIndex}" aria-label="Delete task">&times;</button>
      </div>
    `}).join('');

    // Checkbox handlers
    tasksList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = +cb.dataset.i;
        tasks[idx].completed = cb.checked;
        saveData(TASKS_KEY, tasks);
        renderTasks();
      });
    });

    // Delete handlers
    tasksList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        tasks.splice(+btn.dataset.i, 1);
        saveData(TASKS_KEY, tasks);
        renderTasks();
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  taskToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = tasksPanel.classList.contains('show');
    if (isOpen) {
      tasksPanel.classList.remove('show');
      tasksPanel.setAttribute('aria-hidden', 'true');
      taskToggle.setAttribute('aria-expanded', 'false');
    } else {
      tasksPanel.classList.add('show');
      tasksPanel.setAttribute('aria-hidden', 'false');
      taskToggle.setAttribute('aria-expanded', 'true');
      renderTasks();
    }
  });

  addTaskBtn.addEventListener('click', () => {
    const v = newTaskIn.value.trim();
    if (!v) return;
    const date = newTaskDate.value;
    tasks.push({ text: v, completed: false, dueDate: date });
    saveData(TASKS_KEY, tasks);
    newTaskIn.value = '';
    newTaskDate.value = '';
    renderTasks();
  });

  // Enter key to add task
  newTaskIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTaskBtn.click();
    }
  });

  document.addEventListener('click', e => {
    if (!tasksPanel.contains(e.target) && e.target !== taskToggle) {
      tasksPanel.classList.remove('show');
      tasksPanel.setAttribute('aria-hidden', 'true');
      taskToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════════════════
  refreshImageGrid();
  refreshBannerGrid();
  refreshIcsFeedsList();
  loadForm();
  applyBackground();
  applyAccentColor();
  applyTaskListSetting();
  applyNotesSetting();
  applyBannerSetting();
  applyTheme();
  applyAnimatedBg();
});