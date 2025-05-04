// Wait until DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const SETTINGS_KEY = 'sp_settings';
    const IMAGES_KEY = 'sp_images';
    const TASKS_KEY = 'sp_tasks';
    const NOTES_KEY = 'sp_notes';
    
    // Load settings from localStorage first, if not available try cookies
    function loadSettings() {
      let settings;
      try {
        // First try localStorage
        const lsData = localStorage.getItem(SETTINGS_KEY);
        if (lsData) {
          settings = JSON.parse(lsData);
        } else {
          // Try cookies as fallback
          const cookieData = getCookie(SETTINGS_KEY);
          if (cookieData) {
            settings = JSON.parse(cookieData);
          } else {
            settings = {};
          }
        }
      } catch (e) {
        console.error('Error loading settings:', e);
        settings = {};
      }
      return settings;
    }
    
    // Save settings to both localStorage and cookies
    function saveSettings(settings) {
      try {
        // Save to localStorage
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        // Backup to cookies
        setCookie(SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    }
    
    // Load data from localStorage with cookie fallback
    function loadData(key, defaultValue = '[]') {
      try {
        // First try localStorage
        const lsData = localStorage.getItem(key);
        if (lsData) {
          return JSON.parse(lsData);
        }
        
        // Try cookies as fallback
        const cookieData = getCookie(key);
        if (cookieData) {
          return JSON.parse(cookieData);
        }
      } catch (e) {
        console.error(`Error loading ${key}:`, e);
      }
      return JSON.parse(defaultValue);
    }
    
    // Save data to both localStorage and cookies
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
    
    let settings = loadSettings();
    let images = loadData(IMAGES_KEY);
    let tasks = loadData(TASKS_KEY);
  
    // Default background pools
    const defaultBackgrounds = {
      environment: Array.from({ length: 10 }, (_, i) => `images/environment/background${i+1}.jpg`),
      anime:       Array.from({ length: 10 }, (_, i) => `images/anime/background${i+1}.jpg`)
    };
  
    // Quick links data
    const linksData = [
      { text:'youtube',      url:'https://www.youtube.com'      },
      { text:'twitter',      url:'https://twitter.com'          },
      { text:'reddit',       url:'https://www.reddit.com'      },
      { text:'pmail',        url:'https://protonmail.com'      },
      { text:'gmail',        url:'https://mail.google.com'     },
      { text:'github',       url:'https://github.com'          },
      { text:'4chan',        url:'https://www.4chan.org'       },
      { text:'light novels', url:'https://www.novelupdates.com/'},
      { text:'notion',       url:'https://www.notion.so'        }
    ];
  
    // ─── DOM references ─────────────────────────────────────────────────────────
    const mainUi               = document.getElementById('main-ui');
    const settingsPanel        = document.getElementById('settings-panel');
    const cog                  = document.getElementById('settings-cog');
    const saveBtn              = document.getElementById('save-settings-btn');
    const saveMsg              = document.getElementById('save-message');
  
    const bgSelect             = document.getElementById('background-select');
    const colorWrap            = document.getElementById('bg-color-picker-container');
    const colorInput           = document.getElementById('bg-color-input');
    const uploadBtn            = document.getElementById('upload-btn');
    const fileInput            = document.getElementById('image-upload');
    const fileName             = document.getElementById('file-name-display');
    const imgGrid              = document.getElementById('uploaded-images-grid');
  
    const accentIn             = document.getElementById('accent-color-input');
    const engineSel            = document.getElementById('search-engine-select');
    const apiKeyIn             = document.getElementById('api-key-input');
    const cityIdIn             = document.getElementById('city-id-input');
    const linkNum              = document.getElementById('link-number-select');
    const linkText             = document.getElementById('link-text-input');
    const linkUrl              = document.getElementById('link-url-input');
  
    // Settings toggles
    const settingsTaskToggle    = document.getElementById('settings-tasklist-toggle');
    const settingsNotesToggle   = document.getElementById('settings-notes-toggle');
    const settingsClockToggle   = document.getElementById('settings-clock24-toggle');
    const settingsSecondsToggle = document.getElementById('settings-seconds-toggle');
    const settingsBannerToggle  = document.getElementById('settings-banner-toggle');
  
    // Task list elements
    const taskToggle   = document.getElementById('task-list-toggle');
    const tasksPanel   = document.getElementById('tasks-panel');
    const tasksList    = document.getElementById('tasks-list');
    const newTaskIn    = document.getElementById('new-task-input');
    const addTaskBtn   = document.getElementById('add-task-btn');
  
    // Notes elements
    const notesSection = document.querySelector('.notes-section');
    const notesInput   = document.getElementById('notes-input');
    
    // Banner elements
    const bannerImg    = document.getElementById('banner');
    const bannerSection = document.querySelector('.banner-section');
  
    // ─── Event handlers ─────────────────────────────────────────────────────────
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
  
    cog.addEventListener('click', () => {
      mainUi.classList.add('hidden');
      settingsPanel.classList.remove('hidden');
      loadForm();
    });
  
    saveBtn.addEventListener('click', () => {
      saveSettings(settings);
      saveData(IMAGES_KEY, images);
      
      settingsPanel.classList.add('hidden');
      mainUi.classList.remove('hidden');
      applyBackground();
      applyTaskListSetting();
      applyNotesSetting();
      applyBannerSetting();
      
      // Show confirmation message
      saveMsg.textContent = 'Settings saved!';
      setTimeout(() => saveMsg.textContent = '', 2000);
    });
  
    // ─── UI helper functions ───────────────────────────────────────────────────
    function applyBackground() {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
      if (settings.folder === 'solid' && settings.bgColor) {
        document.body.style.backgroundColor = settings.bgColor;
      } else if (settings.folder === 'custom' && settings.bg) {
        document.body.style.backgroundImage = `url("${settings.bg}")`;
      } else {
        const pool = defaultBackgrounds[settings.folder || 'environment'];
        const pick = pool[Math.floor(Math.random() * pool.length)];
        document.body.style.backgroundImage = `url("${pick}")`;
      }
    }
  
    function applyTaskListSetting() {
      const v = settings.tasksEnabled !== false;
      taskToggle.style.display = v ? 'block' : 'none';
      if (!v) tasksPanel.style.display = 'none';
    }
  
    function applyNotesSetting() {
      const v = settings.notesEnabled !== false;
      notesSection.style.display = v ? 'block' : 'none';
    }

    function applyBannerSetting() {
      const show = settings.bannerEnabled !== false;
      if (show) bannerImg.removeAttribute('hidden');
      else      bannerImg.setAttribute('hidden', '');
    }
      
  
    // ─── Quick links initialization ─────────────────────────────────────────────
    (function initLinks() {
      const lc = document.querySelector('.links');
      linksData.forEach(ln => {
        const a = document.createElement('a');
        a.href = ln.url; a.textContent = ln.text;
        lc.appendChild(a);
      });
      linkNum.innerHTML = linksData.map((ln,i) =>
        `<option value="${i}">${ln.text}</option>`
      ).join('');
      linkNum.addEventListener('change', () => {
        const idx = +linkNum.value;
        linkText.value = linksData[idx].text;
        linkUrl.value  = linksData[idx].url;
      });
    })();
  
    // ─── Clock display ──────────────────────────────────────────────────────────
    (function initClock() {
      const dt = document.getElementById('datetime');
      function update() {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const opts = { hour: 'numeric', minute: 'numeric', hour12: !settings.clock24 };
        if (settings.showSeconds) opts.second = 'numeric';
        const timeStr = now.toLocaleTimeString([], opts);
        dt.textContent = `${dateStr} ${timeStr}`;
      }
      update();
      setInterval(update, 1000);
    })();
  
    // ─── Weather widget ────────────────────────────────────────────────────────
    async function updateWeather() {
      if (!settings.apiKey || !settings.cityId) return;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?id=${settings.cityId}` +
          `&appid=${settings.apiKey}&units=metric`
        );
        const js = await res.json();
        document.getElementById('weather').textContent =
          `${js.weather[0].main} ${js.main.temp}°C`;
      } catch {}
    }
    updateWeather();
  
    // ─── Search form ───────────────────────────────────────────────────────────
    document.getElementById('search-form')
      .addEventListener('submit', e => {
        e.preventDefault();
        const q = document.getElementById('search-input').value.trim();
        if (!q) return;
        const engines = {
          google:     `https://www.google.com/search?q=${encodeURIComponent(q)}`,
          bing:       `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
          duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
          startpage:  `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
          qwant:      `https://www.qwant.com/?q=${encodeURIComponent(q)}`,
          perplexity: `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`
        };
        window.location.href = engines[settings.engine || 'google'];
      });
  
    // ─── Calendar setup ─────────────────────────────────────────────────────────
    (function initCalendar() {
      let cur = new Date();
      const tbody = document.getElementById('calendar-body');
      const monthSpan = document.getElementById('calendar-month');
      function build(d) {
        tbody.innerHTML = '';
        monthSpan.textContent = d.toLocaleString('default',{month:'long',year:'numeric'});
        const y=d.getFullYear(), m=d.getMonth(), f=new Date(y,m,1).getDay(),
              days=new Date(y,m+1,0).getDate();
        let row = document.createElement('tr');
        for (let i=0; i<f; i++) row.appendChild(document.createElement('td'));
        for (let day=1; day<=days; day++) {
          if (row.children.length===7) { tbody.appendChild(row); row = document.createElement('tr'); }
          const cell = document.createElement('td');
          cell.textContent = day;
          if (day===new Date().getDate() && m===new Date().getMonth()) cell.classList.add('current-day');
          row.appendChild(cell);
        }
        tbody.appendChild(row);
      }
      document.getElementById('previous-month-btn').addEventListener('click', () => { cur.setMonth(cur.getMonth()-1); build(cur); });
      document.getElementById('next-month-btn').addEventListener('click', () => { cur.setMonth(cur.getMonth()+1); build(cur); });
      build(cur);
    })();
  
    // ─── Calendar toggle ───────────────────────────────────────────────────────
    const calendarEl = document.getElementById('calendar');
    const datetimeEl = document.getElementById('datetime');
    datetimeEl.addEventListener('click', e => { e.stopPropagation(); calendarEl.classList.toggle('show'); });
    document.addEventListener('click', e => {
      if (!calendarEl.contains(e.target) && e.target !== datetimeEl) calendarEl.classList.remove('show');
    });
  
    // ─── Settings form helpers ─────────────────────────────────────────────────
    function ensureCustomOption() {
      if (images.length && !bgSelect.querySelector('option[value="custom"]')) {
        const o = document.createElement('option');
        o.value = 'custom'; o.textContent = 'Custom Upload';
        bgSelect.appendChild(o);
      }
    }
    
    function refreshImageGrid() {
      imgGrid.innerHTML = images.map((src,i) => `
        <div style="position:relative">
          <img src="${src}" style="width:100%;height:auto;border:1px solid #555">
          <button data-index="${i}" style="position:absolute;top:2px;right:2px;">×</button>
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
          loadForm();
        });
      });
    }
  
    function loadForm() {
      ensureCustomOption();
      settings.folder = settings.folder || 'environment';
      bgSelect.value = settings.folder;
      colorWrap.style.display = settings.folder==='solid'?'block':'none';
      if (settings.bgColor) colorInput.value = settings.bgColor;
      fileName.textContent = '';
      refreshImageGrid();
      accentIn.value  = settings.color || '#8e8cd8';
      engineSel.value = settings.engine || 'google';
      apiKeyIn.value  = settings.apiKey || '';
      cityIdIn.value  = settings.cityId || '';
      linkNum.value   = settings.linkNum  || 0;
      settingsTaskToggle.checked  = settings.tasksEnabled !== false;
      settingsNotesToggle.checked = settings.notesEnabled !== false;
      settingsClockToggle.checked = settings.clock24 === true;
      settingsSecondsToggle.checked = settings.showSeconds === true;
      settingsBannerToggle.checked = settings.bannerEnabled !== false;
    }
  
    // ─── Initial setup ─────────────────────────────────────────────────────────
    loadForm();
    applyBackground();
    applyTaskListSetting();
    applyNotesSetting();
    applyBannerSetting();
    
    // Load notes
    notesInput.value = localStorage.getItem(NOTES_KEY) || getCookie(NOTES_KEY) || '';
  
    // ─── Task list rendering ───────────────────────────────────────────────────
    function renderTasks() {
      tasksList.innerHTML = tasks.map((t,i) => `
        <div class="task-item">
          <span>${t}</span>
          <button data-i="${i}">&times;</button>
        </div>
      `).join('');
      tasksList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          tasks.splice(+btn.dataset.i, 1);
          saveData(TASKS_KEY, tasks);
          renderTasks();
        });
      });
    }
  
    taskToggle.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = tasksPanel.style.display === 'block';
      tasksPanel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) renderTasks();
    });
  
    addTaskBtn.addEventListener('click', () => {
      const v = newTaskIn.value.trim();
      if (!v) return;
      tasks.push(v);
      saveData(TASKS_KEY, tasks);
      newTaskIn.value = '';
      renderTasks();
    });
  
    document.addEventListener('click', e => {
      if (!tasksPanel.contains(e.target) && e.target !== taskToggle) {
        tasksPanel.style.display = 'none';
      }
    });
    
    bgSelect.addEventListener('change', () => {
      settings.folder = bgSelect.value;
      colorWrap.style.display = settings.folder === 'solid' ? 'block' : 'none';
    });

    colorInput.addEventListener('change', () => {
      settings.bgColor = colorInput.value;
    });

    accentIn.addEventListener('change', () => {
      settings.color = accentIn.value;
      document.documentElement.style.setProperty('--accent-color', settings.color);
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

    // File upload handling
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgSrc = e.target.result;
          images.push(imgSrc);
          settings.folder = 'custom';
          settings.bg = imgSrc;
          refreshImageGrid();
          ensureCustomOption();
          bgSelect.value = 'custom';
        };
        reader.readAsDataURL(file);
      }
    });
  });