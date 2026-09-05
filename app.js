(() => {
  const STORAGE_KEY = "digifocus:v1";
  const MIN_TASKS = 3;
  const PLACEHOLDER = "what's your priority";

  const QUOTES = [
    "Focus on being productive instead of busy.",
    "One thing at a time is still progress.",
    "Protect your attention like it is gold.",
    "Small focused hours beat scattered days.",
    "You do not have to finish, you have to begin.",
    "Quiet mind, clear work.",
    "Deep work is a kindness to future you.",
    "Stay with the task that matters most.",
  ];

  const DEFAULT_MESH =
    "radial-gradient(ellipse 70% 55% at 8% 6%, #ff2ea6 0%, transparent 52%), radial-gradient(ellipse 55% 50% at 96% 4%, #ffc8a8 0%, transparent 48%), radial-gradient(ellipse 80% 70% at 50% 108%, #2de8d0 0%, transparent 46%), radial-gradient(ellipse 90% 80% at 18% 92%, #1a1aff 0%, transparent 55%), radial-gradient(ellipse 80% 70% at 88% 88%, #6b1fff 0%, transparent 50%), linear-gradient(165deg, #c44dff 0%, #3a27c8 42%, #14105a 100%)";

  const THEMES = [
    { id: "mesh", name: "Neon Mesh", cat: "gradient", animated: false, bg: DEFAULT_MESH },
    { id: "sunset", name: "Sunset Wash", cat: "gradient", bg: "linear-gradient(160deg, #ff9a7a, #ff5d8f 40%, #5b2cff)" },
    { id: "ocean", name: "Deep Ocean", cat: "gradient", bg: "linear-gradient(180deg, #1b3a6b, #0b1d40 50%, #041018)" },
    { id: "mint", name: "Mint Night", cat: "gradient", bg: "linear-gradient(135deg, #7fffd4, #3a7bd5 55%, #1b1464)" },
    { id: "ember", name: "Ember", cat: "gradient", bg: "linear-gradient(180deg, #ffb347, #ff512f 45%, #1a0533)" },
    { id: "aurora", name: "Aurora", cat: "animated", animated: true, bg: "linear-gradient(120deg, #00f5a0, #00d9f5 35%, #9b5cff 70%, #1a0540)" },
    { id: "pulse", name: "Pulse", cat: "animated", animated: true, bg: "radial-gradient(circle at 20% 20%, #ff4ecd, transparent 40%), radial-gradient(circle at 80% 80%, #4ef0ff, #120838)" },
    { id: "lake", name: "Lake", cat: "scenic", bg: "linear-gradient(180deg, #89c4ff, #2b6cb0 40%, #0b1b33)" },
    { id: "dusk", name: "Dusk Ridge", cat: "scenic", bg: "linear-gradient(180deg, #ffb38a, #c45c8a 38%, #2b2158)" },
    { id: "forest", name: "Canopy", cat: "nature", bg: "linear-gradient(180deg, #86efac, #166534 50%, #052e16)" },
    { id: "moss", name: "Moss", cat: "nature", bg: "linear-gradient(160deg, #bbf7d0, #3f6212 55%, #14532d)" },
    { id: "city", name: "Night City", cat: "urban", bg: "linear-gradient(180deg, #1e293b, #0f172a 40%, #020617), radial-gradient(circle at 70% 80%, #f59e0b 0%, transparent 22%)" },
    { id: "neon", name: "Alley", cat: "urban", bg: "linear-gradient(135deg, #fb7185, #7c3aed 50%, #0f172a)" },
    { id: "loft", name: "Loft", cat: "interior", bg: "linear-gradient(180deg, #e7d5c5, #8b6b4a 45%, #2a1d14)" },
    { id: "studio", name: "Studio", cat: "interior", bg: "linear-gradient(180deg, #cbd5e1, #64748b 40%, #1e293b)" },
    { id: "orb", name: "Orbs", cat: "abstract", bg: "radial-gradient(circle at 30% 30%, #f0abfc, transparent 35%), radial-gradient(circle at 80% 60%, #67e8f9, #1e1b4b)" },
    { id: "silk", name: "Silk", cat: "abstract", bg: "conic-gradient(from 120deg, #f472b6, #818cf8, #22d3ee, #f472b6)" },
  ];

  const SOUNDS = [
    { id: "white", name: "White Noise" },
    { id: "pink", name: "Pink Noise" },
    { id: "brown", name: "Brown Noise" },
    { id: "exam", name: "Exam Hall" },
    { id: "cafe", name: "Cafe" },
    { id: "rain", name: "Rain" },
    { id: "nature", name: "Nature" },
    { id: "sea", name: "Sea Waves" },
    { id: "fire", name: "Fireplace" },
    { id: "thunder", name: "Thunderstorm" },
    { id: "library", name: "Library" },
    { id: "space", name: "Outer Space / Lo-Fi" },
  ];

  const TIMER = { focus: 45 * 60, short: 5 * 60, long: 20 * 60 };

  const ZONES = [
    "UTC",
    "Pacific/Honolulu",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Africa/Lagos",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Asia/Singapore",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  const defaultState = () => ({
    name: "",
    quote: QUOTES[0],
    autoQuotes: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    clockStyle: "default",
    night: false,
    notepad: "",
    tasks: Array.from({ length: MIN_TASKS }, (_, i) => ({ id: uid(), text: PLACEHOLDER, done: false })),
    favorites: [],
    themeSlot: "home",
    themeFilter: "all",
    themes: {
      home: { type: "gradient", value: DEFAULT_MESH, animated: false },
      focus: { type: "gradient", value: DEFAULT_MESH, animated: false },
      ambient: { type: "gradient", value: THEMES.find((t) => t.id === "aurora").bg, animated: true },
    },
    yt: "",
    sp: "",
  });

  let state = load();
  let view = "home";
  let themeFilter = "all";
  let themeSlot = "home";
  let clockTimer;
  let pomodoro = { mode: "focus", remaining: TIMER.focus, running: false, handle: null };
  let audio = { ctx: null, nodes: [], current: null, gain: null, volume: 0.35 };
  let localFiles = [];

  const $ = (id) => document.getElementById(id);
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      return defaultState();
    }
  }

  function save() {
    const { tasks, notepad, name, quote, autoQuotes, timeZone, clockStyle, night, favorites, themes, yt, sp } = state;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks, notepad, name, quote, autoQuotes, timeZone, clockStyle, night, favorites, themes, yt, sp })
      );
    } catch {
      /* quota — skip large custom images if needed */
    }
  }

  function show(el) {
    el.hidden = false;
    el.classList.remove("hidden");
  }
  function hide(el) {
    el.hidden = true;
    el.classList.add("hidden");
  }

  function openModal(name) {
    show($("modal-" + name));
    qsa(".toolbar-left .icon-btn").forEach((b) => b.classList.remove("active"));
    const map = { todo: "btn-todo", music: "btn-music", notes: "btn-notes" };
    if (map[name]) $(map[name]).classList.add("active");
    if (name === "settings") $("btn-settings").classList.add("active");
  }

  function closeModals() {
    ["todo", "music", "notes", "settings"].forEach((n) => hide($("modal-" + n)));
    qsa(".icon-btn").forEach((b) => {
      if (b.id !== "btn-home" && b.id !== "btn-timer" && b.id !== "btn-daynight") b.classList.remove("active");
    });
    if (view === "home") $("btn-home").classList.add("home-active");
    save();
  }

  function currentTheme() {
    const slot = view === "timer" ? "focus" : state.themes.ambient && audio.current ? "home" : "home";
    return state.themes[view === "timer" ? "focus" : "home"];
  }

  function applyBackground() {
    const layer = $("bg-layer");
    const theme = currentTheme();
    layer.classList.toggle("animated", Boolean(theme.animated));
    if (theme.type === "image") {
      layer.style.background = `center / cover no-repeat url("${theme.value}")`;
    } else {
      layer.style.background = theme.value;
    }
    $("theme-preview").style.background = layer.style.background;
  }

  function hour12ForZone(tz) {
    return [
      "Pacific/Honolulu",
      "America/Los_Angeles",
      "America/Denver",
      "America/Chicago",
      "America/New_York",
      "America/Sao_Paulo",
    ].includes(tz);
  }

  function nowInZone() {
    const tz = state.timeZone;
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: hour12ForZone(tz),
    }).formatToParts(now);
    const grab = (t) => parts.find((p) => p.type === t)?.value || "";
    let hh = grab("hour");
    const mm = grab("minute");
    if (!hour12ForZone(tz)) hh = hh.padStart(2, "0");
    else hh = String(parseInt(hh, 10));
    return {
      weekday: grab("weekday"),
      month: grab("month"),
      day: grab("day"),
      hh: hh.padStart(2, "0"),
      mm,
      text: `${hh.padStart(2, "0")}:${mm}`,
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGreeting(info) {
    $("greeting").innerHTML = `${info.weekday}, ${info.month} ${info.day} — Welcome, <strong>${escapeHtml(state.name)}</strong>`;
  }

  function renderClock() {
    const info = nowInZone();
    renderGreeting(info);
    const clock = $("clock");
    clock.classList.toggle("clock-traditional", state.clockStyle === "traditional");
    clock.classList.toggle("clock-flip", state.clockStyle === "flip");
    const face = qs("[data-clock-face]", clock);
    if (state.clockStyle === "flip") {
      face.textContent = info.text;
      let row = qs(".flip-row", clock);
      if (!row) {
        row = document.createElement("div");
        row.className = "flip-row";
        clock.appendChild(row);
      }
      const chars = [...info.hh, ":", ...info.mm];
      row.innerHTML = chars
        .map((c) => (c === ":" ? `<span class="flip-colon">:</span>` : `<span class="flip-card">${c}</span>`))
        .join("");
    } else {
      const row = qs(".flip-row", clock);
      if (row) row.remove();
      face.textContent = info.text;
    }
  }

  function startClock() {
    clearInterval(clockTimer);
    renderClock();
    clockTimer = setInterval(renderClock, 1000);
  }

  function renderQuote() {
    const q = state.quote.replace(/^["“]|["”]$/g, "");
    $("quote-text").textContent = `“${q}”`;
  }

  function renderTasks() {
    const list = $("task-list");
    list.innerHTML = "";
    state.tasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = "task-box";
      row.innerHTML = `<input type="checkbox" ${task.done ? "checked" : ""} aria-label="Complete task" /><input type="text" maxlength="80" value="" />`;
      const [box, input] = row.children;
      input.value = task.text;
      input.addEventListener("input", () => {
        task.text = input.value;
        save();
      });
      box.addEventListener("change", () => {
        if (!box.checked) return;
        state.tasks = state.tasks.filter((t) => t.id !== task.id);
        while (state.tasks.length < MIN_TASKS) {
          state.tasks.push({ id: uid(), text: PLACEHOLDER, done: false });
        }
        save();
        renderTasks();
      });
      list.appendChild(row);
    });
  }

  function renderSounds() {
    const grid = $("sound-grid");
    const favSet = new Set(state.favorites);
    const ordered = [...SOUNDS].sort((a, b) => Number(favSet.has(b.id)) - Number(favSet.has(a.id)));
    grid.innerHTML = "";
    ordered.forEach((s) => {
      const card = document.createElement("button");
      card.className = "sound-card" + (audio.current === s.id ? " active" : "");
      card.type = "button";
      card.innerHTML = `<span>${s.name}</span><span class="heart ${favSet.has(s.id) ? "on" : ""}" data-fav="${s.id}">♥</span>`;
      card.addEventListener("click", (e) => {
        if (e.target.dataset.fav) {
          e.stopPropagation();
          toggleFav(s.id);
          return;
        }
        toggleSound(s.id);
      });
      grid.appendChild(card);
    });
  }

  function toggleFav(id) {
    if (state.favorites.includes(id)) state.favorites = state.favorites.filter((x) => x !== id);
    else state.favorites.push(id);
    save();
    renderSounds();
  }

  function ensureAudio() {
    if (!audio.ctx) audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    if (!audio.gain) {
      audio.gain = audio.ctx.createGain();
      audio.gain.gain.value = audio.volume;
      audio.gain.connect(audio.ctx.destination);
    }
  }

  function stopSound() {
    audio.nodes.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect();
      } catch {}
    });
    audio.nodes = [];
    audio.current = null;
    $("now-playing-label").textContent = "Select a sound";
    renderSounds();
  }

  function noiseBuffer(type) {
    const ctx = audio.ctx;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === "white") data[i] = w * 0.4;
      else if (type === "brown") {
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      } else {
        last = 0.98 * last + 0.02 * w;
        data[i] = (w + last) * 0.35;
      }
    }
    return buf;
  }

  function loopNoise(type, filterFreq, filterType = "lowpass", extraQ = 0.7) {
    const src = audio.ctx.createBufferSource();
    src.buffer = noiseBuffer(type);
    src.loop = true;
    const filter = audio.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = extraQ;
    src.connect(filter);
    filter.connect(audio.gain);
    src.start();
    audio.nodes.push(src, filter);
  }

  function startSound(id) {
    ensureAudio();
    stopSound();
    audio.current = id;
    $("now-playing-label").textContent = SOUNDS.find((s) => s.id === id).name;
    const recipes = {
      white: () => loopNoise("white", 12000),
      pink: () => loopNoise("pink", 4000),
      brown: () => loopNoise("brown", 800),
      rain: () => {
        loopNoise("white", 1800);
        loopNoise("pink", 900, "highpass");
      },
      sea: () => loopNoise("brown", 500, "lowpass", 0.4),
      nature: () => {
        loopNoise("pink", 2200);
        const osc = audio.ctx.createOscillator();
        const g = audio.ctx.createGain();
        osc.frequency.value = 880;
        g.gain.value = 0.012;
        osc.connect(g);
        g.connect(audio.gain);
        osc.start();
        audio.nodes.push(osc, g);
      },
      cafe: () => {
        loopNoise("pink", 1400);
        loopNoise("white", 4000, "bandpass", 0.8);
      },
      exam: () => loopNoise("pink", 900),
      library: () => loopNoise("brown", 600),
      fire: () => loopNoise("pink", 700, "lowpass", 1.2),
      thunder: () => {
        loopNoise("brown", 300);
        loopNoise("white", 2000, "lowpass");
      },
      space: () => {
        loopNoise("brown", 400);
        const osc = audio.ctx.createOscillator();
        const g = audio.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 110;
        g.gain.value = 0.04;
        osc.connect(g);
        g.connect(audio.gain);
        osc.start();
        audio.nodes.push(osc, g);
      },
    };
    (recipes[id] || recipes.white)();
    renderSounds();
  }

  function toggleSound(id) {
    if (audio.current === id) stopSound();
    else startSound(id);
  }

  function playChime() {
    ensureAudio();
    const start = audio.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = audio.ctx.createOscillator();
      const g = audio.ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "sine";
      g.gain.setValueAtTime(0.0001, start + i);
      g.gain.exponentialRampToValueAtTime(0.2, start + i + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, start + i + 0.9);
      osc.connect(g);
      g.connect(audio.ctx.destination);
      osc.start(start + i);
      osc.stop(start + i + 1);
    }
  }

  function formatTimer(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function tickTimer() {
    if (!pomodoro.running) return;
    pomodoro.remaining -= 1;
    $("timer-display").textContent = formatTimer(Math.max(0, pomodoro.remaining));
    if (pomodoro.remaining <= 0) {
      pomodoro.running = false;
      clearInterval(pomodoro.handle);
      playChime();
    }
  }

  function setTimerMode(mode) {
    pomodoro.mode = mode;
    pomodoro.running = false;
    clearInterval(pomodoro.handle);
    pomodoro.remaining = TIMER[mode];
    $("timer-display").textContent = formatTimer(pomodoro.remaining);
    qsa("[data-timer-mode]").forEach((b) => b.classList.toggle("active", b.dataset.timerMode === mode));
  }

  function setView(next) {
    view = next;
    if (next === "home") {
      show($("home-view"));
      hide($("timer-view"));
      $("btn-home").classList.add("home-active");
      $("btn-timer").classList.remove("active");
    } else {
      hide($("home-view"));
      show($("timer-view"));
      $("btn-home").classList.remove("home-active");
      $("btn-timer").classList.add("active");
      $("timer-display").textContent = formatTimer(pomodoro.remaining);
    }
    applyBackground();
  }

  function renderThemeLibrary(target, compact) {
    const filter = compact ? "all" : themeFilter;
    const items = THEMES.filter((t) => {
      if (filter === "all") return true;
      if (filter === "animated") return t.cat === "animated" || t.animated;
      if (filter === "gradient") return t.cat === "gradient";
      return t.cat === filter;
    });
    target.innerHTML = "";
    items.forEach((t) => {
      const btn = document.createElement("button");
      btn.className = "theme-swatch";
      btn.style.background = t.bg;
      btn.innerHTML = `<span>${t.name}</span>`;
      btn.addEventListener("click", () => {
        const slot = compact ? "focus" : themeSlot;
        state.themes[slot] = { type: "gradient", value: t.bg, animated: Boolean(t.animated) };
        save();
        applyBackground();
      });
      target.appendChild(btn);
    });
  }

  function setCustomBg(file, slot) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.themes[slot] = { type: "image", value: reader.result, animated: false };
      save();
      applyBackground();
    };
    reader.readAsDataURL(file);
  }

  function wireDrop(zone, input, slotFn) {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("drag");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag");
      const file = e.dataTransfer.files[0];
      setCustomBg(file, slotFn());
    });
    input.addEventListener("change", () => setCustomBg(input.files[0], slotFn()));
  }

  function parseYouTube(url) {
    try {
      const u = new URL(url);
      const list = u.searchParams.get("list");
      if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
      if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch {}
    return null;
  }

  function parseSpotify(url) {
    const m = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (m) return `https://open.spotify.com/embed/playlist/${m[1]}`;
    return null;
  }

  function setEmbed(src) {
    $("embed-frame").innerHTML = src ? `<iframe src="${src}" allow="autoplay; clipboard-write; encrypted-media; fullscreen" allowfullscreen></iframe>` : "";
  }

  function updateCounts() {
    const text = $("notepad").innerText || "";
    const chars = text.replace(/\s/g, "").length ? text.length : text.trim().length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    $("note-counts").textContent = `${words} words · ${chars} characters`;
  }

  function populateZones() {
    const sel = $("timezone");
    const extra = state.timeZone && !ZONES.includes(state.timeZone) ? [state.timeZone, ...ZONES] : ZONES;
    sel.innerHTML = extra.map((z) => `<option value="${z}">${z}</option>`).join("");
    sel.value = extra.includes(state.timeZone) ? state.timeZone : extra[0];
  }

  function showOnboarding(on) {
    if (on) show($("onboarding"));
    else hide($("onboarding"));
  }

  function applyNight() {
    document.body.classList.toggle("night", state.night);
    qs(".icon-sun").classList.toggle("hidden", state.night);
    qs(".icon-moon").classList.toggle("hidden", !state.night);
  }

  function bind() {
    $("onboard-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("name-input").value.trim();
      if (!name) return;
      state.name = name;
      save();
      showOnboarding(false);
      renderClock();
    });

    $("btn-todo").addEventListener("click", () => openModal("todo"));
    $("btn-music").addEventListener("click", () => openModal("music"));
    $("btn-notes").addEventListener("click", () => {
      $("notepad").innerHTML = state.notepad || "";
      updateCounts();
      openModal("notes");
    });
    $("btn-settings").addEventListener("click", () => {
      $("account-name").value = state.name;
      $("quote-input").value = state.quote;
      populateZones();
      qsa("[data-clock-style]").forEach((b) => b.classList.toggle("active", b.dataset.clockStyle === state.clockStyle));
      renderThemeLibrary($("theme-library"));
      renderThemeLibrary($("timer-theme-mini"), true);
      applyBackground();
      openModal("settings");
    });
    $("btn-home").addEventListener("click", () => setView("home"));
    $("btn-timer").addEventListener("click", () => setView("timer"));
    $("btn-shuffle-quote").addEventListener("click", () => {
      state.quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      state.autoQuotes = true;
      save();
      renderQuote();
    });
    $("btn-zen").addEventListener("click", () => {
      document.body.classList.toggle("zen");
      $("btn-zen").classList.toggle("active", document.body.classList.contains("zen"));
    });
    $("btn-daynight").addEventListener("click", () => {
      state.night = !state.night;
      applyNight();
      save();
    });
    $("btn-fullscreen").addEventListener("click", async () => {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen().catch(() => {});
      else await document.exitFullscreen().catch(() => {});
    });

    qsa("[data-close]").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.close === "notes") {
          state.notepad = $("notepad").innerHTML;
        }
        closeModals();
      })
    );
    qsa(".modal").forEach((m) =>
      m.addEventListener("click", (e) => {
        if (e.target === m) {
          if (m.id === "modal-notes") state.notepad = $("notepad").innerHTML;
          closeModals();
        }
      })
    );

    $("add-task").addEventListener("click", () => {
      state.tasks.push({ id: uid(), text: PLACEHOLDER, done: false });
      save();
      renderTasks();
    });

    qsa("[data-music-tab]").forEach((tab) =>
      tab.addEventListener("click", () => {
        qsa("[data-music-tab]").forEach((t) => t.classList.toggle("active", t === tab));
        const mine = tab.dataset.musicTab === "mine";
        $("tab-sounds").classList.toggle("hidden", mine);
        $("tab-sounds").hidden = mine;
        $("tab-mine").classList.toggle("hidden", !mine);
        $("tab-mine").hidden = !mine;
      })
    );

    $("sound-volume").addEventListener("input", (e) => {
      audio.volume = Number(e.target.value);
      if (audio.gain) audio.gain.gain.value = audio.volume;
    });

    $("local-audio").addEventListener("change", () => {
      const files = [...$("local-audio").files];
      localFiles = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
      const ul = $("local-playlist");
      ul.innerHTML = "";
      localFiles.forEach((f) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = f.name;
        btn.addEventListener("click", () => {
          const player = $("local-player");
          player.src = f.url;
          player.play();
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
    });

    $("yt-load").addEventListener("click", () => {
      const src = parseYouTube($("yt-url").value.trim());
      state.yt = $("yt-url").value.trim();
      save();
      setEmbed(src);
    });
    $("sp-load").addEventListener("click", () => {
      const src = parseSpotify($("sp-url").value.trim());
      state.sp = $("sp-url").value.trim();
      save();
      setEmbed(src);
    });

    qsa("#editor-toolbar [data-cmd]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        const val = btn.dataset.value || null;
        document.execCommand(cmd, false, val);
        $("notepad").focus();
        state.notepad = $("notepad").innerHTML;
        updateCounts();
        save();
      })
    );
    $("insert-check").addEventListener("click", (e) => {
      e.preventDefault();
      document.execCommand("insertHTML", false, `<div class="check-line"><input type="checkbox" /> task</div>`);
      state.notepad = $("notepad").innerHTML;
      save();
      updateCounts();
    });
    $("notepad").addEventListener("input", () => {
      state.notepad = $("notepad").innerHTML;
      updateCounts();
      save();
    });

    qsa("[data-settings]").forEach((btn) =>
      btn.addEventListener("click", () => {
        qsa("[data-settings]").forEach((b) => b.classList.toggle("active", b === btn));
        ["themes", "clock", "focus", "quotes", "account"].forEach((id) => {
          const pane = $("set-" + (id === "focus" ? "focus" : id));
          const on = btn.dataset.settings === id;
          pane.classList.toggle("hidden", !on);
          pane.hidden = !on;
        });
      })
    );

    qsa("[data-theme-slot]").forEach((btn) =>
      btn.addEventListener("click", () => {
        themeSlot = btn.dataset.themeSlot;
        qsa("[data-theme-slot]").forEach((b) => b.classList.toggle("active", b === btn));
        const t = state.themes[themeSlot];
        $("theme-preview").style.background = t.type === "image" ? `center / cover no-repeat url("${t.value}")` : t.value;
      })
    );

    qsa("[data-filter]").forEach((btn) =>
      btn.addEventListener("click", () => {
        themeFilter = btn.dataset.filter;
        qsa("[data-filter]").forEach((b) => b.classList.toggle("active", b === btn));
        renderThemeLibrary($("theme-library"));
      })
    );

    qsa("[data-clock-style]").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.clockStyle = btn.dataset.clockStyle;
        qsa("[data-clock-style]").forEach((b) => b.classList.toggle("active", b === btn));
        save();
        renderClock();
      })
    );

    $("quote-save").addEventListener("click", () => {
      state.quote = $("quote-input").value.trim() || QUOTES[0];
      state.autoQuotes = false;
      save();
      renderQuote();
    });
    $("quote-auto").addEventListener("click", () => {
      state.autoQuotes = true;
      state.quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      $("quote-input").value = state.quote;
      save();
      renderQuote();
    });
    $("account-save").addEventListener("click", () => {
      state.name = $("account-name").value.trim() || state.name;
      state.timeZone = $("timezone").value;
      save();
      renderClock();
    });

    qsa("[data-timer-mode]").forEach((btn) => btn.addEventListener("click", () => setTimerMode(btn.dataset.timerMode)));
    $("timer-start").addEventListener("click", () => {
      if (pomodoro.running) return;
      pomodoro.running = true;
      clearInterval(pomodoro.handle);
      pomodoro.handle = setInterval(tickTimer, 1000);
    });
    $("timer-stop").addEventListener("click", () => {
      pomodoro.running = false;
      clearInterval(pomodoro.handle);
    });
    $("timer-reset").addEventListener("click", () => setTimerMode(pomodoro.mode));

    wireDrop($("bg-drop"), $("bg-file"), () => themeSlot);
    wireDrop($("timer-bg-drop"), $("timer-bg-file"), () => "focus");

    if (state.autoQuotes) {
      const hour = new Date().getHours();
      state.quote = QUOTES[hour % QUOTES.length];
    }
  }

  function init() {
    bind();
    applyNight();
    renderQuote();
    renderTasks();
    renderSounds();
    populateZones();
    $("quote-input").value = state.quote;
    $("yt-url").value = state.yt || "";
    $("sp-url").value = state.sp || "";
    if (state.yt) setEmbed(parseYouTube(state.yt));
    else if (state.sp) setEmbed(parseSpotify(state.sp));
    startClock();
    applyBackground();
    setView("home");
    showOnboarding(!state.name);
    if (!state.name) $("name-input").focus();
  }

  init();
})();
