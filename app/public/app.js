'use strict';

/* FFmpeg Studio - front-end application */
(() => {
  const ROUTES = {
    dashboard: { title: '工作台', crumb: '工作台' },
    convert: { title: '格式转换', crumb: '格式转换' },
    edit: { title: '剪辑工坊', crumb: '剪辑工坊' },
    inspect: { title: '媒体信息', crumb: '媒体信息' },
    jobs: { title: '任务队列', crumb: '任务队列' },
    system: { title: '引擎与设置', crumb: '引擎与设置' }
  };

  const ICONS = {
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    swap: '<path d="M4 8h15l-3.2-3.2M20 16H5l3.2 3.2"/>',
    scissors: '<circle cx="6" cy="7" r="2.3"/><circle cx="6" cy="17" r="2.3"/><path d="m8 8.5 11 7M8 15.5l11-7"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><circle cx="12" cy="12" r="3.2"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".9" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r=".9" fill="currentColor" stroke="none"/>',
    cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><rect x="3.5" y="3.5" width="17" height="17" rx="3" opacity=".25"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    shield: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-2.5Z"/><path d="m9 12 2 2 4-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    film: '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><path d="M7.5 4.5v15M16.5 4.5v15M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-5 4 4 3-3 4 4"/>',
    play: '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    download: '<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 17v2h14v-2"/>',
    folder: '<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5v-10Z"/>',
    terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><path d="m7 9 3 3-3 3M12.5 15H17"/>',
    zap: '<path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6.5 7l.8 12h9.4l.8-12M10 10.5v5M14 10.5v5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-1.8 5.4M20 4.5V11h-6.3"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/>',
    arrowRight: '<path d="M4 12h15m0 0-5-5m5 5-5 5"/>',
    alert: '<path d="M12 8v5M12 16.5v.5"/><path d="M10.2 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.8 4.2a2 2 0 0 0-3.6 0Z"/>',
    loader: '<path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round"/>',
    hardDrive: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="M3 13h18M7 16.5h.01M10.5 16.5h.01"/>',
    gauge: '<path d="M4.5 17a8.5 8.5 0 1 1 15 0"/><path d="m12 13 4-3"/><circle cx="12" cy="14" r="1.3" fill="currentColor" stroke="none"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m4 12 8 4.5 8-4.5M4 16l8 4.5 8-4.5"/>',
    wand: '<path d="m5 19-1 1M4 4l1 1M20 20l-1-1M17 3l-1 1M9 5l.8 2.2L12 8l-2.2.8L9 11l-.8-2.2L6 8l2.2-.8L9 5ZM18 12l.6 1.7 1.7.6-1.7.6L18 17l-.6-1.7-1.7-.6 1.7-.6L18 12Z"/><path d="m6 18 7.5-7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    rotateRight: '<path d="M20 11a8 8 0 1 0-2 5.3M20 4.5V11h-6.5"/>',
    rotateLeft: '<path d="M4 11a8 8 0 1 1 2 5.3M4 4.5V11h6.5"/>',
    flipH: '<path d="M12 3v18M8 7 4 12l4 5M16 7l4 5-4 5"/>',
    flipV: '<path d="M3 12h18M7 8l5-4 5 4M7 16l5 4 5-4"/>',
    crop: '<path d="M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    volume: '<path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M8.5 20h7"/>',
    disc: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3.5v3M12 17.5v3"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8v.4"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
    sparkles: '<path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 15l.5 1.5L7 17l-1.5.5L5 19l-.5-1.5L3 17l1.5-.5L5 15Z"/>',
    file: '<path d="M6 3h7l5 5v13H6V3Z"/><path d="M13 3v5h5"/>',
    folderOpen: '<path d="M3.5 8V6.5A1.5 1.5 0 0 1 5 5h4l2 2h7a1.5 1.5 0 0 1 1.5 1.5V10"/><path d="M3.5 10h18l-2.2 7.5a2 2 0 0 1-1.9 1.5H5.6a2 2 0 0 1-1.9-1.5L3.5 10Z"/>',
    power: '<path d="M12 3v8M6.3 5.8a8 8 0 1 0 11.4 0"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/>'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function icon(name, cls = '') {
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.sparkles}</svg>`;
  }

  function hydrateIcons(root = document) {
    $$('[data-icon]', root).forEach((el) => {
      if (!el.innerHTML.trim()) el.innerHTML = icon(el.dataset.icon);
    });
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function attr(value) {
    return esc(value).replace(/`/g, '&#96;');
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, Number(n) || 0));
  }

  function fmtBytes(bytes, digits = 1) {
    const n = Number(bytes) || 0;
    if (n <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const idx = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
    const value = n / Math.pow(1024, idx);
    return `${value.toFixed(idx === 0 ? 0 : digits)} ${units[idx]}`;
  }

  function fmtDuration(seconds, withMs = false) {
    const n = Number(seconds) || 0;
    if (!Number.isFinite(n) || n < 0) return '00:00';
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);
    const s = n % 60;
    if (withMs && h === 0) return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')}`;
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function timeAgo(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diff) || diff < 0) return '刚刚';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小时前`;
    return `${Math.floor(hours / 24)} 天前`;
  }

  function fmtBitrate(bps) {
    const n = Number(bps) || 0;
    if (!n) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)} Mbps`;
    return `${Math.round(n / 1000)} kbps`;
  }

  function shortVersion(version) {
    const v = String(version || '');
    const match = v.match(/(\d+\.\d+(?:\.\d+)?)/);
    return match ? match[1] : v || '—';
  }

  const STATUS_LABEL = {
    queued: '排队中',
    running: '处理中',
    completed: '已完成',
    failed: '失败',
    canceled: '已取消'
  };

  function statusPill(status) {
    return `<span class="job-status ${esc(status)}"><i></i>${esc(STATUS_LABEL[status] || status)}</span>`;
  }

  function kindLabel(kind) {
    return kind === 'audio' ? '音频' : kind === 'image' ? '图片' : '视频';
  }

  function kindIcon(kind) {
    return kind === 'audio' ? 'music' : kind === 'image' ? 'image' : 'film';
  }

  const DEFAULT_CONVERT = {
    format: 'mp4',
    videoCodec: 'auto',
    audioCodec: 'auto',
    crf: 22,
    preset: 'medium',
    rateMode: 'crf',
    videoBitrate: 6000,
    resolution: 'source',
    scaleMode: 'fit',
    customWidth: 1920,
    customHeight: 1080,
    fps: 'source',
    audioBitrate: 192,
    sampleRate: 0,
    channels: 0,
    hardware: 'none',
    stripMetadata: false,
    threads: 0,
    outputName: '',
    gifFps: 12,
    gifWidth: 640
  };

  const DEFAULT_EDIT = {
    format: 'mp4',
    videoCodec: 'auto',
    audioCodec: 'auto',
    crf: 20,
    preset: 'medium',
    rateMode: 'crf',
    videoBitrate: 7000,
    hardware: 'none',
    start: 0,
    end: 0,
    speed: 1,
    volume: 1,
    rotate: '0',
    flipHorizontal: false,
    flipVertical: false,
    brightness: 0,
    contrast: 1,
    saturation: 1,
    denoise: false,
    sharpen: false,
    fadeIn: 0,
    fadeOut: 0,
    crop: { enabled: false, width: 1280, height: 720, x: 0, y: 0 },
    scale: { enabled: false, width: 1920, height: 1080 },
    watermark: { enabled: false, text: 'FFmpeg Studio', size: 30, opacity: 0.8, position: 'bottom-right' },
    gifFps: 12,
    gifWidth: 640,
    outputName: ''
  };

  function deepMerge(base, extra) {
    const out = Array.isArray(base) ? [...base] : { ...base };
    if (!extra || typeof extra !== 'object') return out;
    for (const [key, value] of Object.entries(extra)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && base?.[key] && typeof base[key] === 'object') {
        out[key] = deepMerge(base[key], value);
      } else if (value !== undefined) {
        out[key] = value;
      }
    }
    return out;
  }

  function loadStoredSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem('ffstudio.settings.v1') || '{}');
      return { convert: deepMerge(DEFAULT_CONVERT, raw.convert), edit: deepMerge(DEFAULT_EDIT, raw.edit) };
    } catch {
      return { convert: { ...DEFAULT_CONVERT }, edit: deepMerge(DEFAULT_EDIT, {}) };
    }
  }

  const stored = loadStoredSettings();
  const state = {
    route: 'dashboard',
    system: null,
    media: [],
    jobs: [],
    activeMediaId: null,
    selectedMediaIds: new Set(),
    convert: stored.convert,
    edit: stored.edit,
    jobFilter: 'all',
    jobDetailId: null,
    advancedOpen: false,
    selftest: null,
    selftestRunning: false,
    booted: false,
    pollTimer: null,
    jobPollBusy: false,
    knownStatuses: new Map(),
    uploadCount: 0,
    uploadActive: 0,
    previewSeq: 0
  };

  let saveTimer = null;
  let previewTimer = null;
  let dragDepth = 0;

  function saveSettings() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('ffstudio.settings.v1', JSON.stringify({ convert: state.convert, edit: state.edit }));
      } catch {}
    }, 160);
  }

  function activeMedia() {
    return state.media.find((m) => m.id === state.activeMediaId) || state.media[0] || null;
  }

  function setByPath(root, path, value) {
    const parts = String(path).split('.');
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (!cursor[parts[i]] || typeof cursor[parts[i]] !== 'object') cursor[parts[i]] = {};
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  function getByPath(root, path) {
    return String(path).split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), root);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const type = response.headers.get('content-type') || '';
    const payload = type.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload?.error || `请求失败 (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function routeFromHash() {
    const name = (location.hash || '').replace(/^#\/?/, '').trim();
    return ROUTES[name] ? name : 'dashboard';
  }

  function navigate(route) {
    if (!ROUTES[route]) route = 'dashboard';
    if (location.hash === `#/${route}`) {
      state.route = route;
      render();
    } else {
      location.hash = `#/${route}`;
    }
  }

  function toast(title, message = '', type = 'info', duration = 4200) {
    const stack = $('#toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const iconName = type === 'success' ? 'checkCircle' : type === 'error' ? 'alert' : 'info';
    el.innerHTML = `
      <span class="toast-icon">${icon(iconName)}</span>
      <div><strong>${esc(title)}</strong>${message ? `<p>${esc(message)}</p>` : ''}</div>`;
    stack.appendChild(el);
    while (stack.children.length > 4) stack.firstElementChild.remove();
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 220);
    }, duration);
  }

  function showEngineLoading() {
    const dot = $('#engine-dot');
    const topDot = $('#top-engine-dot');
    const label = $('#engine-label');
    if (dot) dot.className = 'status-dot is-loading';
    if (topDot) topDot.className = 'status-dot is-loading';
    if (label) label.textContent = '正在连接引擎';
  }

  function updateEngineUI() {
    const system = state.system;
    if (!system) return;
    const available = Boolean(system.ffmpeg?.available);
    const running = state.jobs.filter((j) => j.status === 'running').length;
    const version = shortVersion(system.ffmpeg?.version);
    const dot = $('#engine-dot');
    const topDot = $('#top-engine-dot');
    if (dot) dot.className = `status-dot ${available ? (running ? 'is-busy' : '') : 'is-offline'}`;
    if (topDot) topDot.className = `status-dot ${available ? (running ? 'is-busy' : '') : 'is-offline'}`;
    const label = $('#engine-label');
    if (label) label.textContent = available ? (running ? '引擎处理中' : '本地引擎就绪') : '引擎不可用';
    const versionEl = $('#engine-version');
    if (versionEl) versionEl.textContent = available ? `FFmpeg ${version} · 原生` : '未检测到 ffmpeg.exe';
    const topText = $('#top-engine-text');
    if (topText) topText.textContent = available ? (running ? '处理中' : '引擎就绪') : '引擎离线';
    const topVersion = $('#top-ffmpeg-version');
    if (topVersion) topVersion.textContent = available ? `v${version}` : 'missing';
    const track = $('#engine-track');
    if (track) track.style.width = available ? '100%' : '28%';
    const live = $('#nav-live');
    if (live) live.hidden = !running;
  }

  function updateNavCounts() {
    const badge = $('#nav-convert-badge');
    if (badge) badge.textContent = String(state.media.length);
    const live = $('#nav-live');
    if (live) live.hidden = !state.jobs.some((j) => j.status === 'running');
  }

  function openSidebar() {
    $('#sidebar')?.classList.add('open');
    const scrim = $('#sidebar-scrim');
    if (scrim) scrim.hidden = false;
  }

  function closeSidebar() {
    $('#sidebar')?.classList.remove('open');
    const scrim = $('#sidebar-scrim');
    if (scrim) scrim.hidden = true;
  }

  async function loadInitial() {
    showEngineLoading();
    try {
      const [system, mediaData, jobsData] = await Promise.all([
        api('/api/system'),
        api('/api/media'),
        api('/api/jobs?limit=100')
      ]);
      state.system = system;
      state.media = mediaData.media || [];
      state.jobs = jobsData.jobs || [];
      state.selectedMediaIds = new Set(state.media.map((m) => m.id));
      state.activeMediaId = state.media[0]?.id || null;
      state.knownStatuses = new Map(state.jobs.map((j) => [j.id, j.status]));
      state.booted = true;
      updateEngineUI();
      updateNavCounts();
      render();
      scheduleJobPoll(600);
      if (!system.ffmpeg?.available) {
        toast('未找到 FFmpeg', '请确认 ffmpeg/bin/ffmpeg.exe 存在，或在系统设置中检查路径。', 'error', 8000);
      }
    } catch (error) {
      state.booted = false;
      const view = $('#view');
      if (view) {
        view.innerHTML = `
          <div class="boot-splash">
            <div class="boot-logo" style="color:var(--danger);background:var(--danger-soft);border-color:rgba(255,115,115,.2)">${icon('alert')}</div>
            <h2 style="font-size:18px;font-weight:560;color:var(--text)">无法连接本地服务</h2>
            <p style="margin-top:8px;max-width:420px;text-align:center;line-height:1.7">${esc(error.message)}<br>请通过 Start.bat 启动 FFmpeg Studio，或刷新页面重试。</p>
            <button class="btn btn-primary" style="margin-top:18px" onclick="location.reload()">${icon('refresh')}重新连接</button>
          </div>`;
      }
      updateEngineUI();
      toast('连接失败', error.message, 'error', 8000);
    }
  }

  function pageHead(eyebrow, title, subtitle, actions = '') {
    return `
      <div class="page-head">
        <div>
          <div class="page-eyebrow">${esc(eyebrow)}</div>
          <h1 class="page-title">${title}</h1>
          ${subtitle ? `<p class="page-sub">${subtitle}</p>` : ''}
        </div>
        ${actions ? `<div class="page-actions">${actions}</div>` : ''}
      </div>`;
  }

  function render() {
    const route = routeFromHash();
    state.route = route;
    const view = $('#view');
    if (!view) return;
    $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.route === route));
    const crumb = $('#crumb-title');
    if (crumb) crumb.textContent = ROUTES[route].crumb;
    document.title = `${ROUTES[route].title} · FFmpeg Studio`;

    let html = '';
    if (!state.booted) {
      html = `<div class="boot-splash"><div class="boot-logo">${icon('film')}</div><p>正在唤醒 FFmpeg 引擎…</p><div class="boot-bar"><span></span></div></div>`;
    } else if (route === 'dashboard') html = renderDashboard();
    else if (route === 'convert') html = renderConvert();
    else if (route === 'edit') html = renderEdit();
    else if (route === 'inspect') html = renderInspect();
    else if (route === 'jobs') html = renderJobs();
    else if (route === 'system') html = renderSystem();

    view.innerHTML = `<div class="page-enter">${html}</div>`;
    hydrateIcons(view);
    syncRangeVisuals(view);
    if (route === 'convert' || route === 'edit') requestPreview(80);
    updateEngineUI();
    updateNavCounts();
    closeSidebar();
  }

  /* ============================== Dashboard ============================== */

  function renderDashboard() {
    const system = state.system || {};
    const jobs = state.jobs;
    const completed = jobs.filter((j) => j.status === 'completed');
    const active = jobs.filter((j) => ['running', 'queued'].includes(j.status));
    const running = jobs.find((j) => j.status === 'running');
    const latestMedia = state.media[0];
    const totalOutput = completed.reduce((sum, j) => sum + (j.outputSize || 0), 0);
    const free = system.disk?.free || 0;
    const version = shortVersion(system.ffmpeg?.version);
    const heroPct = running ? Math.min(99, running.progress || 0) : 72;
    const heroName = running ? running.outputName : latestMedia ? latestMedia.name : '准备开始第一次转换';
    const heroSub = running ? `${STATUS_LABEL.running} · ${Math.round(running.progress || 0)}% · ${running.speed ? running.speed.toFixed(2) + '×' : '正在启动'}` : latestMedia ? `${latestMedia.summary?.width || 0}×${latestMedia.summary?.height || 0} · ${fmtDuration(latestMedia.summary?.duration || 0)}` : '拖入素材，全部处理都在本机完成';
    const wave = Array.from({ length: 42 }, (_, i) => {
      const h = 22 + Math.round(Math.abs(Math.sin(i * 1.7) * 42) + (i % 5) * 4);
      const done = i / 42 < heroPct / 100;
      return `<i class="${done ? 'done' : ''}" style="--h:${Math.min(100, h)}%"></i>`;
    }).join('');

    const recentRows = jobs.slice(0, 6).map((job) => `
      <tr data-action="open-job" data-id="${attr(job.id)}" style="cursor:pointer">
        <td>
          <div class="job-name-cell">
            <span class="job-file-icon">${icon(kindIcon(mediaKindForJob(job)))}</span>
            <div class="job-name">${esc(job.outputName || job.inputName)}<small>${esc(job.operation === 'edit' ? '剪辑导出' : '格式转换')} · ${timeAgo(job.createdAt)}</small></div>
          </div>
        </td>
        <td>${statusPill(job.status)}</td>
        <td class="mono" style="color:var(--faint);font-size:10px">${job.status === 'completed' ? fmtBytes(job.outputSize) : job.status === 'running' ? Math.round(job.progress) + '%' : '—'}</td>
        <td><div class="job-row-actions">
          ${job.status === 'completed' ? `<a class="icon-btn" href="${attr(job.downloadUrl)}" title="下载">${icon('download')}</a>` : `<button class="icon-btn" data-action="open-job" data-id="${attr(job.id)}" title="详情">${icon('arrowRight')}</button>`}
        </div></td>
      </tr>`).join('');

    return `
      ${pageHead('Overview', '工作台', '今天想让素材变成什么样子？转换、剪辑、检查，全部在本机完成。', `
        <button class="btn" type="button" data-action="open-output">${icon('folderOpen')}输出目录</button>
        <button class="btn btn-primary" type="button" data-action="pick-files">${icon('plus')}导入素材</button>
      `).replace('class="page-title"', 'class="page-title" style="max-width:780px"')}

      <section class="hero">
        <div class="hero-copy">
          <span class="hero-badge"><span class="status-dot"></span>本地原生引擎 · 文件不离开设备</span>
          <h1>让每一帧素材，<br><span class="gradient">都按你的想法呈现。</span></h1>
          <p class="hero-desc">一个为自己准备的可视化 FFmpeg 工作台。无需记参数，实时预览命令，批量转换和精确剪辑都在浏览器里完成。</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" type="button" data-action="pick-files">${icon('upload')}导入一个文件</button>
            <button class="btn btn-lg" type="button" data-action="start-workflow">${icon('swap')}开始转换</button>
          </div>
          <div class="hero-meta">
            <span>${icon('cpu')}FFmpeg ${esc(version)}</span>
            <span>${icon('shield')}100% 本地处理</span>
            <span>${icon('zap')}${system.capabilities?.hardware?.nvidia || system.capabilities?.hardware?.intel || system.capabilities?.hardware?.amd ? '硬件加速可用' : 'CPU 编码就绪'}</span>
          </div>
        </div>
        <div class="hero-visual">
          <div class="device">
            <div class="device-bar"><i></i><i></i><i></i><span>FFMPEG_STUDIO / LIVE</span></div>
            <div class="device-body">
              <div class="device-screen">
                ${latestMedia ? `<img src="${attr(latestMedia.thumbUrl)}" alt="">` : `<div class="film-lines">${icon('film')}</div>`}
                <div class="device-play">${icon('play')}</div>
                <div class="device-caption">
                  <div><strong>${esc(heroName).slice(0, 44)}</strong><small>${esc(heroSub)}</small></div>
                  <span class="badge badge-accent">${running ? 'RUNNING' : 'READY'}</span>
                </div>
              </div>
              <div class="device-timeline">
                <div class="device-wave">${wave}</div>
                <div class="device-labels"><span>00:00</span><span>${running ? fmtDuration(running.duration) : latestMedia ? fmtDuration(latestMedia.summary?.duration || 0) : '--:--'}</span></div>
              </div>
              <div class="device-progress">
                <div class="device-progress-top"><span>${running ? '正在编码' : '工作台就绪'}</span><strong>${running ? Math.round(running.progress) + '%' : 'ONLINE'}</strong></div>
                <div class="device-track"><span style="width:${running ? Math.max(2, running.progress) : 100}%"></span></div>
              </div>
            </div>
            <div class="device-float">${icon('checkCircle')} H.264 · CRF ${state.convert.crf}</div>
            <div class="device-float-b">实时速度 <span>${running?.speed ? running.speed.toFixed(2) + '×' : '—'}</span></div>
          </div>
        </div>
      </section>

      <div class="stats-grid" id="dash-stats">
        ${statCard('已完成任务', completed.length, 'checkCircle', `累计输出 ${fmtBytes(totalOutput)}`, 'accent')}
        ${statCard('正在处理', active.length, 'gauge', active.length ? '任务正在后台运行' : '队列空闲，随时开始', active.length ? 'amber' : '')}
        ${statCard('素材库', state.media.length, 'layers', `本地占用 ${fmtBytes(state.media.reduce((s, m) => s + (m.size || 0), 0))}`, '')}
        ${statCard('可用空间', fmtBytes(free, 0).replace(' ', '<small> ') + '</small>', 'hardDrive', '输出目录所在磁盘', '')}
      </div>

      <div class="dash-grid">
        <div class="dash-col">
          <section class="panel">
            <div class="panel-head"><h2>${icon('sparkles')}快捷开始</h2><span class="section-note">选择一个常用工作流</span></div>
            <div class="panel-body">
              <div class="quick-grid">
                <button class="quick-card" type="button" data-action="quick-preset" data-preset="mp4">
                  <span class="quick-icon">${icon('film')}</span>
                  <div><h3>MP4 · H.264</h3><p>兼容性最好的通用格式</p></div>
                  <span class="quick-arrow">${icon('arrowRight')}</span>
                </button>
                <button class="quick-card" type="button" data-action="quick-preset" data-preset="hevc">
                  <span class="quick-icon">${icon('zap')}</span>
                  <div><h3>HEVC · 高压缩</h3><p>更小体积，保留高画质</p></div>
                  <span class="quick-arrow">${icon('arrowRight')}</span>
                </button>
                <button class="quick-card" type="button" data-action="quick-preset" data-preset="mp3">
                  <span class="quick-icon">${icon('music')}</span>
                  <div><h3>提取音轨</h3><p>从视频中导出 MP3 音频</p></div>
                  <span class="quick-arrow">${icon('arrowRight')}</span>
                </button>
                <button class="quick-card" type="button" data-action="quick-preset" data-preset="gif">
                  <span class="quick-icon">${icon('image')}</span>
                  <div><h3>视频转 GIF</h3><p>制作可分享的循环动图</p></div>
                  <span class="quick-arrow">${icon('arrowRight')}</span>
                </button>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head"><h2>${icon('clock')}最近任务</h2><a href="#/jobs">查看全部 ${icon('arrowRight')}</a></div>
            <div class="panel-body" style="padding-top:10px">
              ${jobs.length ? `
                <table class="job-table">
                  <thead><tr><th>任务</th><th>状态</th><th>输出</th><th></th></tr></thead>
                  <tbody>${recentRows}</tbody>
                </table>` : `
                <div class="empty-state" style="padding:30px 20px;border:0">
                  <div class="empty-icon">${icon('list')}</div>
                  <h3>还没有任务记录</h3>
                  <p>导入一个视频，选择输出格式，你的第一个任务就会出现在这里。</p>
                </div>`}
            </div>
          </section>
        </div>

        <div class="dash-col">
          <section class="panel">
            <div class="panel-head"><h2>${icon('cpu')}引擎状态</h2><a href="#/system">详情 ${icon('arrowRight')}</a></div>
            <div class="panel-body">
              <div class="health-ring">
                <div class="health-ring-visual">
                  <svg viewBox="0 0 63 63"><circle class="ring-bg" cx="31.5" cy="31.5" r="26"/><circle class="ring-fg" cx="31.5" cy="31.5" r="26"/></svg>
                  <span>${system.ffmpeg?.available ? 'OK' : '!'}</span>
                </div>
                <div>
                  <div class="health-title">${system.ffmpeg?.available ? 'FFmpeg 引擎运行正常' : 'FFmpeg 未就绪'}</div>
                  <div class="health-sub">${esc(system.ffmpeg?.version || '未检测到可执行文件')}<br>${system.capabilities?.encoders?.libx264 ? 'libx264 · AAC · VP9 可用' : '编码器状态未知'}</div>
                </div>
              </div>
              <div class="sys-list">
                <div class="sys-row"><span class="sys-row-label">${icon('terminal')}版本</span><span class="sys-row-value">${esc(version)}</span></div>
                <div class="sys-row"><span class="sys-row-label">${icon('gauge')}并发任务</span><span class="sys-row-value">${system.app?.concurrency || 1}</span></div>
                <div class="sys-row"><span class="sys-row-label">${icon('zap')}硬件加速</span><span class="sys-row-value">${system.capabilities?.hardware?.nvidia ? 'NVIDIA NVENC' : system.capabilities?.hardware?.intel ? 'Intel QSV' : system.capabilities?.hardware?.amd ? 'AMD AMF' : 'CPU'}</span></div>
                <div class="sys-row"><span class="sys-row-label">${icon('disc')}工作目录</span><span class="sys-row-value" title="${attr(system.app?.dataDir)}">data/</span></div>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head"><h2>${icon('target')}推荐下一步</h2></div>
            <div class="panel-body">
              ${latestMedia ? `
                <div class="media-card active" data-action="go-edit" style="margin-bottom:10px">
                  <div class="media-thumb"><img src="${attr(latestMedia.thumbUrl)}" alt=""><span class="thumb-fallback">${icon(kindIcon(latestMedia.kind))}</span><span class="thumb-duration">${fmtDuration(latestMedia.summary?.duration || 0)}</span></div>
                  <div class="media-info"><span class="media-name">${esc(latestMedia.name)}</span><div class="media-meta"><span>${fmtBytes(latestMedia.size)}</span><span>${esc(latestMedia.summary?.videoCodec || latestMedia.summary?.audioCodec || '')}</span></div></div>
                  <span class="icon-btn">${icon('arrowRight')}</span>
                </div>
                <div class="stack-10">
                  <button class="btn btn-block" type="button" data-action="go-edit">${icon('scissors')}打开剪辑工坊</button>
                  <button class="btn btn-block" type="button" data-action="go-inspect">${icon('scan')}查看媒体信息</button>
                </div>` : `
                <div class="empty-state" style="padding:24px 16px;border:0">
                  <div class="empty-icon">${icon('upload')}</div>
                  <h3>从一段素材开始</h3>
                  <p>拖入视频或音频文件，剩下的交给 FFmpeg。</p>
                  <button class="btn btn-primary btn-sm" type="button" data-action="pick-files">${icon('plus')}导入素材</button>
                </div>`}
            </div>
          </section>
        </div>
      </div>`;
  }

  function statCard(label, value, iconName, foot, tone = '') {
    return `
      <div class="stat-card ${tone}">
        <div class="stat-top"><span class="stat-label">${esc(label)}</span><span class="stat-icon">${icon(iconName)}</span></div>
        <div class="stat-value">${value}</div>
        <div class="stat-foot">${foot || ''}</div>
      </div>`;
  }

  function mediaKindForJob(job) {
    const m = state.media.find((item) => item.id === job.mediaId);
    return m?.kind || (job.outputName?.match(/\.(mp3|wav|flac|m4a|opus)$/i) ? 'audio' : 'video');
  }

  /* ============================== Convert ============================== */

  function formatOption(format) {
    const map = {
      mp4: ['MP4', 'H.264 / AAC'],
      mkv: ['MKV', 'H.264 / AAC'],
      webm: ['WEBM', 'VP9 / OPUS'],
      mov: ['MOV', 'H.264 / AAC'],
      gif: ['GIF', '循环动图'],
      mp3: ['MP3', '音频'],
      m4a: ['M4A', 'AAC 音频'],
      wav: ['WAV', '无损 PCM'],
      flac: ['FLAC', '无损音频'],
      opus: ['OPUS', '高效音频'],
      jpg: ['JPG', '图片'],
      png: ['PNG', '透明图片'],
      webp: ['WEBP', '图片']
    };
    return map[format] || [format.toUpperCase(), ''];
  }

  function formatGrid(selected, target = 'convert') {
    const formats = ['mp4', 'mkv', 'webm', 'mov', 'gif', 'mp3', 'm4a', 'wav', 'flac', 'opus', 'jpg', 'png', 'webp'];
    return `<div class="format-grid">${formats.map((format) => {
      const [name, desc] = formatOption(format);
      return `<button class="format-card ${selected === format ? 'active' : ''}" type="button" data-action="set-format" data-target="${target}" data-format="${format}"><strong>${name}</strong><small>${desc}</small></button>`;
    }).join('')}</div>`;
  }

  function fieldSelect(label, bind, value, options, extra = '') {
    return `<div class="field">
      <label for="f-${bind.replace(/\./g, '-')}">${label}</label>
      <select class="select" id="f-${bind.replace(/\./g, '-')}" data-bind="${bind}" ${extra}>${options.map(([v, l]) => `<option value="${attr(v)}" ${String(value) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
    </div>`;
  }

  function fieldInput(label, bind, value, type = 'text', extra = '') {
    return `<div class="field">
      <label for="f-${bind.replace(/\./g, '-')}">${label}</label>
      <input class="input ${type === 'number' ? 'mono' : ''}" id="f-${bind.replace(/\./g, '-')}" type="${type}" value="${attr(value)}" data-bind="${bind}" ${extra}>
    </div>`;
  }

  function rangeField(label, bind, value, min, max, step, hint = '', suffix = '') {
    return `<div class="field field-full">
      <div class="slider-head"><span>${label}${hint ? ` · ${hint}` : ''}</span><output data-output-for="${bind}">${value}${suffix}</output></div>
      <input class="range" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-bind="${bind}" data-suffix="${suffix}">
    </div>`;
  }

  function toggleField(label, bind, checked, extra = '') {
    return `<label class="switch"><input type="checkbox" data-bind="${bind}" ${checked ? 'checked' : ''} ${extra}><span class="switch-track"></span><span class="switch-label">${label}</span></label>`;
  }

  function renderConvert() {
    const fmt = state.convert.format;
    const isAudio = ['mp3', 'm4a', 'wav', 'flac', 'opus'].includes(fmt);
    const isGif = fmt === 'gif';
    const isImage = ['jpg', 'png', 'webp'].includes(fmt);
    const media = activeMedia();
    const caps = state.system?.capabilities || {};
    const hw = caps.hardware || {};
    const hwOptions = [['none', 'CPU 编码'], ['auto', '自动（优先 GPU）']];
    if (hw.nvidia) hwOptions.push(['nvidia', 'NVIDIA NVENC']);
    if (hw.intel) hwOptions.push(['intel', 'Intel Quick Sync']);
    if (hw.amd) hwOptions.push(['amd', 'AMD AMF']);
    const selectedCount = [...state.selectedMediaIds].filter((id) => state.media.some((m) => m.id === id)).length;

    const queue = state.media.length ? state.media.map((item) => `
      <div class="queue-media ${item.id === state.activeMediaId ? 'active' : ''}" data-action="activate-media" data-id="${attr(item.id)}">
        <input class="media-check" type="checkbox" data-select-media="${attr(item.id)}" ${state.selectedMediaIds.has(item.id) ? 'checked' : ''} aria-label="选择 ${attr(item.name)}">
        <div class="media-thumb">
          <img src="${attr(item.thumbUrl)}" alt="" loading="lazy">
          <span class="thumb-fallback">${icon(kindIcon(item.kind))}</span>
          <span class="thumb-duration">${fmtDuration(item.summary?.duration || 0)}</span>
        </div>
        <div class="media-info">
          <span class="media-name">${esc(item.name)}</span>
          <div class="media-meta">
            <span>${kindLabel(item.kind)}</span>
            <span>${fmtBytes(item.size)}</span>
            ${item.summary?.width ? `<span>${item.summary.width}×${item.summary.height}</span>` : `<span>${item.summary?.audioCodec || '—'}</span>`}
            <span>${fmtDuration(item.summary?.duration || 0)}</span>
          </div>
        </div>
        <div class="media-actions">
          <button class="icon-btn" type="button" title="查看信息" data-action="inspect-media" data-id="${attr(item.id)}">${icon('scan')}</button>
          <button class="icon-btn danger" type="button" title="移除" data-action="remove-media" data-id="${attr(item.id)}">${icon('trash')}</button>
        </div>
      </div>`).join('') : `
      <div class="empty-state queue-empty">
        <div class="empty-icon">${icon('upload')}</div>
        <h3>素材队列是空的</h3>
        <p>把视频、音频或图片拖进窗口，或者点击下方按钮选择文件。支持批量导入。</p>
        <button class="btn btn-primary" type="button" data-action="pick-files">${icon('plus')}选择文件</button>
      </div>`;

    return `
      ${pageHead('Convert', '格式转换', '保留画面细节，精确控制编码参数。批量任务会自动排队处理。', `
        <button class="btn" type="button" data-action="open-output">${icon('folderOpen')}输出目录</button>
        <button class="btn btn-primary" type="button" data-action="pick-files">${icon('plus')}导入素材</button>
      `)}
      <div class="convert-layout">
        <section class="panel queue-panel">
          <div class="queue-toolbar">
            <div class="queue-title">${icon('layers')}素材队列 <span class="count">${state.media.length} 个文件 · 已选 ${selectedCount}</span></div>
            <div class="queue-tools">
              <button class="select-link" type="button" data-action="select-all">全选</button>
              <span class="faint" style="font-size:10px">·</span>
              <button class="select-link" type="button" data-action="select-none">取消全选</button>
            </div>
          </div>
          <div class="queue-body">
            <div class="queue-drop" data-action="pick-files">
              ${icon('upload')}<strong>拖入文件或点击导入</strong><span class="grow">MP4 · MOV · MKV · MP3 · WAV · 图片</span>
            </div>
            <div class="queue-media-list">${queue}</div>
          </div>
        </section>

        <aside class="settings-panel">
          <div class="settings-head">
            <div class="settings-head-top">
              <div class="settings-title">${icon('sliders')}输出设置</div>
              <span class="badge badge-mono">${esc(fmt.toUpperCase())}</span>
            </div>
            <div class="settings-sub">${media ? `当前预览：${esc(media.name)}` : '选择素材后可预览命令与开始任务'}</div>
          </div>

          <div class="settings-scroll">
            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">输出格式</span><span class="field-value">${fmt.toUpperCase()}</span></div>
              ${formatGrid(fmt)}
            </div>

            ${!isAudio && !isGif && !isImage ? `
            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">视频编码</span><span class="field-value">${esc(caps.encoders?.libx264 ? 'libx264 可用' : '')}</span></div>
              <div class="field-grid">
                ${fieldSelect('编码器', 'convert.videoCodec', state.convert.videoCodec, videoCodecOptions(fmt))}
                ${fieldSelect('硬件加速', 'convert.hardware', state.convert.hardware, hwOptions)}
                ${fieldSelect('速率控制', 'convert.rateMode', state.convert.rateMode, [['crf', '恒定质量 (CRF)'], ['bitrate', '目标码率']], 'data-refresh="convert"')}
                ${fieldSelect('编码预设', 'convert.preset', state.convert.preset, [['veryfast', '很快'], ['fast', '快'], ['medium', '均衡'], ['slow', '慢速 · 更小'], ['veryslow', '极慢 · 最小']])}
                <div class="field-full">
                  ${state.convert.rateMode === 'bitrate'
                    ? fieldInput('视频码率 (kbps)', 'convert.videoBitrate', state.convert.videoBitrate, 'number', 'min="100" max="200000" step="100"')
                    : rangeField('画质 CRF', 'convert.crf', state.convert.crf, 12, 38, 1, '数值越低画质越高')}
                </div>
              </div>
            </div>

            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">画面</span><span class="field-value">${state.convert.resolution === 'source' ? '保持原尺寸' : esc(state.convert.resolution)}</span></div>
              <div class="field-grid">
                ${fieldSelect('分辨率', 'convert.resolution', state.convert.resolution, [['source', '保持原始'], ['2160p', '4K · 2160p'], ['1440p', '2K · 1440p'], ['1080p', '1080p'], ['720p', '720p'], ['480p', '480p'], ['custom', '自定义尺寸']], 'data-refresh="convert"')}
                ${fieldSelect('缩放方式', 'convert.scaleMode', state.convert.scaleMode, [['fit', '完整显示（加黑边）'], ['fill', '填满画面（裁切）']])}
                ${state.convert.resolution === 'custom' ? fieldInput('宽度 px', 'convert.customWidth', state.convert.customWidth, 'number', 'min="2" max="7680" step="2"') : ''}
                ${state.convert.resolution === 'custom' ? fieldInput('高度 px', 'convert.customHeight', state.convert.customHeight, 'number', 'min="2" max="4320" step="2"') : ''}
                ${fieldSelect('帧率', 'convert.fps', state.convert.fps, [['source', '保持原始'], ['60', '60 fps'], ['30', '30 fps'], ['24', '24 fps'], ['15', '15 fps']])}
              </div>
            </div>

            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">音频</span><span class="field-value">${state.convert.audioCodec === 'none' ? '移除音轨' : state.convert.audioCodec.toUpperCase()}</span></div>
              <div class="field-grid">
                ${fieldSelect('音频编码', 'convert.audioCodec', state.convert.audioCodec, [['auto', '跟随格式'], ['aac', 'AAC'], ['mp3', 'MP3'], ['opus', 'Opus'], ['flac', 'FLAC'], ['copy', '直接复制'], ['none', '不要音频']])}
                ${fieldSelect('音频码率', 'convert.audioBitrate', state.convert.audioBitrate, [['96', '96 kbps'], ['128', '128 kbps'], ['192', '192 kbps'], ['256', '256 kbps'], ['320', '320 kbps']])}
                ${fieldSelect('采样率', 'convert.sampleRate', state.convert.sampleRate, [['0', '保持原始'], ['44100', '44.1 kHz'], ['48000', '48 kHz']])}
                ${fieldSelect('声道', 'convert.channels', state.convert.channels, [['0', '保持原始'], ['1', '单声道'], ['2', '立体声']])}
              </div>
            </div>` : ''}

            ${isGif ? `
            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">GIF 参数</span><span class="field-value">调色板优化</span></div>
              <div class="field-grid">
                ${rangeField('帧率', 'convert.gifFps', state.convert.gifFps, 5, 30, 1, 'fps', ' fps')}
                ${rangeField('宽度', 'convert.gifWidth', state.convert.gifWidth, 160, 1280, 20, 'px', ' px')}
              </div>
            </div>` : ''}

            ${isImage ? `
            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">图片输出</span><span class="field-value">单帧</span></div>
              <div class="field-grid">
                ${rangeField('质量', 'convert.crf', state.convert.crf, 2, 31, 1, 'JPEG 质量 2–31，越低越清晰', '')}
                ${fieldSelect('分辨率', 'convert.resolution', state.convert.resolution, [['source', '保持原始'], ['2160p', '4K'], ['1080p', '1080p'], ['720p', '720p'], ['custom', '自定义']], 'data-refresh="convert"')}
                ${state.convert.resolution === 'custom' ? fieldInput('宽度 px', 'convert.customWidth', state.convert.customWidth, 'number', 'min="2" max="7680" step="2"') : ''}
                ${state.convert.resolution === 'custom' ? fieldInput('高度 px', 'convert.customHeight', state.convert.customHeight, 'number', 'min="2" max="4320" step="2"') : ''}
              </div>
            </div>` : ''}

            ${isAudio ? `
            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">音频设置</span><span class="field-value">${esc(fmt.toUpperCase())}</span></div>
              <div class="field-grid">
                ${fieldSelect('音频编码', 'convert.audioCodec', state.convert.audioCodec, [['auto', '跟随格式'], ['aac', 'AAC'], ['mp3', 'MP3'], ['opus', 'Opus'], ['flac', 'FLAC'], ['copy', '直接复制']])}
                ${fieldSelect('音频码率', 'convert.audioBitrate', state.convert.audioBitrate, [['96', '96 kbps'], ['128', '128 kbps'], ['192', '192 kbps'], ['256', '256 kbps'], ['320', '320 kbps']])}
                ${fieldSelect('采样率', 'convert.sampleRate', state.convert.sampleRate, [['0', '保持原始'], ['44100', '44.1 kHz'], ['48000', '48 kHz'], ['96000', '96 kHz']])}
                ${fieldSelect('声道', 'convert.channels', state.convert.channels, [['0', '保持原始'], ['1', '单声道'], ['2', '立体声']])}
              </div>
            </div>` : ''}

            <div class="settings-section">
              <button class="advanced-toggle ${state.advancedOpen ? 'open' : ''}" type="button" data-action="toggle-advanced">${icon('sliders')}高级选项 ${icon('chevronDown')}</button>
              <div class="advanced-body ${state.advancedOpen ? '' : 'hidden'}">
                ${fieldInput('输出文件名（不含扩展名）', 'convert.outputName', state.convert.outputName, 'text', 'placeholder="留空则自动命名"')}
                ${fieldInput('编码线程数（0 = 自动）', 'convert.threads', state.convert.threads, 'number', 'min="0" max="64" step="1"')}
                <div class="toggle-row"><span class="field-label">移除元数据与章节</span>${toggleField('', 'convert.stripMetadata', state.convert.stripMetadata)}</div>
              </div>
            </div>
          </div>

          <div class="settings-command">
            <div class="command-head"><span>${icon('terminal')} FFmpeg 命令预览</span><button type="button" data-action="copy-command">复制命令</button></div>
            <div class="command-box" id="command-preview">${media ? '正在生成命令…' : 'ffmpeg -i <选择素材> …'}</div>
          </div>

          <div class="settings-footer">
            <div class="settings-footer-summary"><span>输出目录 <strong>data/outputs</strong></span><span>${selectedCount} 个任务</span></div>
            <button class="btn btn-primary btn-block" type="button" data-action="start-convert" ${!media || !selectedCount ? 'disabled' : ''}>${icon('play')}开始转换${selectedCount ? ` · ${selectedCount}` : ''}</button>
          </div>
        </aside>
      </div>`;
  }

  /* ============================== Edit ============================== */

  function editFormatOptions() {
    return [
      ['mp4', 'MP4 · H.264 / AAC'],
      ['webm', 'WebM · VP9 / Opus'],
      ['mkv', 'MKV · H.264 / AAC'],
      ['mov', 'MOV · H.264 / AAC'],
      ['gif', 'GIF · 循环动图'],
      ['mp3', 'MP3 · 音频'],
      ['m4a', 'M4A · AAC 音频'],
      ['wav', 'WAV · 无损音频'],
      ['flac', 'FLAC · 无损音频'],
      ['opus', 'OPUS · 高效音频'],
      ['jpg', 'JPG · 单帧图片'],
      ['png', 'PNG · 单帧图片'],
      ['webp', 'WEBP · 单帧图片']
    ];
  }

  function videoCodecOptions(format, allowCopy = true) {
    if (format === 'webm') {
      return [['auto', '自动（VP9）'], ['vp9', 'VP9'], ['av1', 'AV1'], ...(allowCopy ? [['copy', '直接复制流']] : [])];
    }
    return [['auto', '自动'], ['h264', 'H.264 / AVC'], ['hevc', 'H.265 / HEVC'], ['av1', 'AV1'], ['vp9', 'VP9'], ...(allowCopy ? [['copy', '直接复制流']] : [])];
  }

  function normalizeEditRange(media) {
    const duration = Number(media?.summary?.duration || 0);
    if (duration <= 0) {
      state.edit.start = 0;
      state.edit.end = 0;
      return { start: 0, end: 0, duration: 0 };
    }
    let start = clamp(state.edit.start, 0, Math.max(0, duration - 0.1));
    let end = Number(state.edit.end);
    if (!Number.isFinite(end) || end <= 0 || end > duration) end = duration;
    if (end <= start) end = duration;
    start = Math.round(start * 10) / 10;
    end = Math.round(end * 10) / 10;
    if (end <= start) end = Math.min(duration, start + 0.1);
    state.edit.start = start;
    state.edit.end = end;
    return { start, end, duration };
  }

  function renderEdit() {
    const media = activeMedia();
    if (!media) {
      return `${pageHead('Edit', '剪辑工坊', '裁切、变速、调色、加水印，用一个时间轴完成轻量后期。', `<button class="btn" type="button" data-action="open-output">${icon('folderOpen')}输出目录</button><button class="btn btn-primary" type="button" data-action="pick-files">${icon('plus')}导入素材</button>`)}
        <section class="panel"><div class="empty-state" style="padding:80px 24px;border:0">
          <div class="empty-icon">${icon('scissors')}</div>
          <h3>先导入一段素材</h3>
          <p>视频、音频和图片都可以进入剪辑工坊。所有处理仍然由本机 FFmpeg 完成。</p>
          <button class="btn btn-primary" type="button" data-action="pick-files">${icon('upload')}选择文件</button>
        </div></section>`;
    }
    const kind = media.kind || media.summary?.kind || 'video';
    const isAudio = kind === 'audio';
    const isImage = kind === 'image';
    if (isAudio && !['mp3', 'm4a', 'wav', 'flac', 'opus'].includes(state.edit.format)) {
      state.edit.format = 'm4a';
    }
    if (isImage && !['jpg', 'png', 'webp'].includes(state.edit.format)) {
      state.edit.format = 'jpg';
    }
    const duration = Number(media.summary?.duration || 0);
    const { start, end } = normalizeEditRange(media);
    const fmt = state.edit.format;
    const isAudioOut = ['mp3', 'm4a', 'wav', 'flac', 'opus'].includes(fmt);
    const isImageOut = ['jpg', 'png', 'webp'].includes(fmt);
    const isStill = isImage || isImageOut;
    const caps = state.system?.capabilities?.encoders || {};
    const startPct = duration ? (start / duration) * 100 : 0;
    const endPct = duration ? (end / duration) * 100 : 100;
    const outputLength = Math.max(0, (end - start) / (Number(state.edit.speed) || 1));

    const player = isImage
      ? `<img src="${attr(media.fileUrl)}" alt="${attr(media.name)}">`
      : isAudio
        ? `<div style="width:100%;padding:26px 28px">
             <img src="${attr(media.thumbUrl)}" alt="" style="width:100%;max-height:170px;object-fit:contain;border-radius:10px;margin-bottom:22px;opacity:.9">
             <audio controls preload="metadata" src="${attr(media.fileUrl)}"></audio>
           </div>`
        : `<video controls preload="metadata" poster="${attr(media.thumbUrl)}" src="${attr(media.fileUrl)}"></video>`;

    return `
      ${pageHead('Edit', '剪辑工坊', '组合时间裁剪、画面变换、色彩和声音处理。调整参数时，下方命令会同步更新。', `
        <button class="btn" type="button" data-action="open-output">${icon('folderOpen')}输出目录</button>
        <button class="btn btn-primary" type="button" data-action="pick-files">${icon('plus')}导入素材</button>
      `)}
      <div class="edit-layout">
        <section class="panel preview-panel">
          <div class="preview-head">
            <div class="preview-title">${icon('film')}预览与时间轴</div>
            <select class="edit-select" id="edit-media-select" data-media-select aria-label="选择素材">
              ${state.media.map((m) => `<option value="${attr(m.id)}" ${m.id === media.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}
            </select>
          </div>
          <div class="player-shell">${player}
            <div class="player-overlay-badge">
              <span class="badge badge-accent">${kindLabel(kind)}</span>
              ${media.summary?.width ? `<span class="badge">${media.summary.width}×${media.summary.height}</span>` : ''}
              <span class="badge">${fmtDuration(duration)}</span>
            </div>
          </div>
          ${duration > 0 ? `
          <div class="trim-area">
            <div class="trim-head">
              <strong>${icon('scissors')}保留区间</strong>
              <div class="trim-times">输出 <span id="edit-output-length">${fmtDuration(outputLength, true)}</span> · 共 ${fmtDuration(duration)}</div>
            </div>
            <div class="trim-track-wrap">
              <div class="trim-track" id="trim-track" style="--left:${startPct}%;--right:${100 - endPct}%">
                <div class="trim-thumb" id="trim-thumb-start" style="left:${startPct}%"></div>
                <div class="trim-thumb end" id="trim-thumb-end" style="left:${endPct}%"></div>
              </div>
            </div>
            <div class="two-col" style="margin-top:8px">
              <div class="field">
                <div class="slider-head"><span>起点</span><output id="trim-start-out">${fmtDuration(start, true)}</output></div>
                <input class="range" id="trim-start" type="range" min="0" max="${duration.toFixed(2)}" step="0.1" value="${start}" data-trim="start">
              </div>
              <div class="field">
                <div class="slider-head"><span>终点</span><output id="trim-end-out">${fmtDuration(end, true)}</output></div>
                <input class="range" id="trim-end" type="range" min="0" max="${duration.toFixed(2)}" step="0.1" value="${end}" data-trim="end">
              </div>
            </div>
          </div>` : `
          <div class="edit-preview-note">${icon('info')}${isImage ? '图片素材没有时间轴，将按单帧输出。' : '该素材没有可读取的时长，将按完整内容处理。'}</div>`}
          ${!isAudio && !isImage ? `<div class="edit-preview-note">${icon('info')}浏览器无法预览部分编码格式时，导出结果不受影响。</div>` : ''}
        </section>

        <aside class="settings-panel">
          <div class="settings-head">
            <div class="settings-head-top">
              <div class="settings-title">${icon('sliders')}编辑参数</div>
              <button class="btn btn-sm" type="button" data-action="reset-edit">${icon('refresh')}重置</button>
            </div>
            <div class="settings-sub">${esc(media.name)} · ${fmtBytes(media.size)}</div>
          </div>

          <div class="settings-scroll">
            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">基础</span><span class="field-value">${esc(fmt.toUpperCase())}</span></div>
              <div class="field-grid">
                ${fieldSelect('输出格式', 'edit.format', state.edit.format, editFormatOptions(), 'data-refresh="edit"')}
                ${isAudioOut || isImageOut ? '' : fieldSelect('视频编码', 'edit.videoCodec', state.edit.videoCodec, videoCodecOptions(fmt, false))}
                ${isAudioOut || isImageOut ? '' : rangeField('画质 CRF', 'edit.crf', state.edit.crf, 12, 38, 1, '越低越清晰')}
                ${isStill ? '' : rangeField('速度', 'edit.speed', state.edit.speed, 0.25, 4, 0.05, '0.25× – 4×', '×')}
                ${isStill ? '' : rangeField('音量', 'edit.volume', state.edit.volume, 0, 2, 0.05, '原始为 1×', '×')}
              </div>
            </div>

            ${!isAudioOut ? `
            <div class="settings-section">
              <div class="edit-section-head"><div class="edit-section-title">${icon('crop')}画面变换</div></div>
              <div class="toggle-row" style="margin-bottom:${state.edit.crop.enabled ? '11px' : '4px'}">
                <span class="field-label">裁剪画面</span>${toggleField('', 'edit.crop.enabled', state.edit.crop.enabled, 'data-refresh="edit"')}
              </div>
              ${state.edit.crop.enabled ? `<div class="field-grid" style="margin-bottom:12px">
                ${fieldInput('宽 px', 'edit.crop.width', state.edit.crop.width, 'number', 'min="2" max="7680" step="2"')}
                ${fieldInput('高 px', 'edit.crop.height', state.edit.crop.height, 'number', 'min="2" max="4320" step="2"')}
                ${fieldInput('X 偏移', 'edit.crop.x', state.edit.crop.x, 'number', 'min="0" step="2"')}
                ${fieldInput('Y 偏移', 'edit.crop.y', state.edit.crop.y, 'number', 'min="0" step="2"')}
              </div>` : ''}
              <div class="toggle-row" style="margin-bottom:${state.edit.scale.enabled ? '11px' : '4px'}">
                <span class="field-label">缩放到指定尺寸</span>${toggleField('', 'edit.scale.enabled', state.edit.scale.enabled, 'data-refresh="edit"')}
              </div>
              ${state.edit.scale.enabled ? `<div class="field-grid" style="margin-bottom:12px">
                ${fieldInput('宽 px', 'edit.scale.width', state.edit.scale.width, 'number', 'min="2" max="7680" step="2"')}
                ${fieldInput('高 px', 'edit.scale.height', state.edit.scale.height, 'number', 'min="2" max="4320" step="2"')}
              </div>` : ''}
              <div class="field-label-row"><span class="field-label">旋转与翻转</span></div>
              <div class="row-between">
                <div class="rotate-buttons">
                  ${['0', '90', '180', '270'].map((deg) => `<button class="rotate-btn ${state.edit.rotate === deg ? 'active' : ''}" type="button" title="旋转 ${deg}°" data-action="set-rotate" data-deg="${deg}">${icon(deg === '270' ? 'rotateLeft' : 'rotateRight')}<span style="position:absolute;font-size:0">${deg}</span></button>`).join('')}
                </div>
                <div class="rotate-buttons">
                  <button class="rotate-btn ${state.edit.flipHorizontal ? 'active' : ''}" type="button" title="水平翻转" data-action="toggle-flip" data-dir="h">${icon('flipH')}</button>
                  <button class="rotate-btn ${state.edit.flipVertical ? 'active' : ''}" type="button" title="垂直翻转" data-action="toggle-flip" data-dir="v">${icon('flipV')}</button>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <div class="edit-section-head"><div class="edit-section-title">${icon('sliders')}色彩与细节</div></div>
              <div class="field-grid">
                ${rangeField('亮度', 'edit.brightness', state.edit.brightness, -1, 1, 0.01)}
                ${rangeField('对比度', 'edit.contrast', state.edit.contrast, 0, 2, 0.01)}
                ${rangeField('饱和度', 'edit.saturation', state.edit.saturation, 0, 3, 0.01)}
                <div class="toggle-row"><span class="field-label">降噪</span>${toggleField('', 'edit.denoise', state.edit.denoise)}</div>
                <div class="toggle-row"><span class="field-label">锐化</span>${toggleField('', 'edit.sharpen', state.edit.sharpen)}</div>
              </div>
            </div>` : ''}

            <div class="settings-section">
              <div class="edit-section-head"><div class="edit-section-title">${icon('sparkles')}${isStill ? '水印与画面' : '氛围与声音'}</div></div>
              ${isStill ? '' : `<div class="field-grid">
                ${rangeField('淡入', 'edit.fadeIn', state.edit.fadeIn, 0, 10, 0.1, '秒', 's')}
                ${rangeField('淡出', 'edit.fadeOut', state.edit.fadeOut, 0, 10, 0.1, '秒', 's')}
              </div>`}
              <div class="toggle-row" style="margin-top:9px;margin-bottom:${state.edit.watermark.enabled ? '10px' : '0'}">
                <span class="field-label">文字水印</span>${toggleField('', 'edit.watermark.enabled', state.edit.watermark.enabled, 'data-refresh="edit"')}
              </div>
              ${state.edit.watermark.enabled ? `<div class="field-grid">
                <div class="field field-full"><label>水印文字</label><input class="input" type="text" maxlength="80" data-bind="edit.watermark.text" value="${attr(state.edit.watermark.text)}" placeholder="输入水印文字"></div>
                ${fieldSelect('位置', 'edit.watermark.position', state.edit.watermark.position, [['top-left', '左上'], ['top-right', '右上'], ['bottom-left', '左下'], ['bottom-right', '右下'], ['center', '居中']])}
                ${rangeField('字号', 'edit.watermark.size', state.edit.watermark.size, 10, 90, 1, 'px', ' px')}
                ${rangeField('透明度', 'edit.watermark.opacity', state.edit.watermark.opacity, 0.1, 1, 0.05)}
              </div>` : ''}
            </div>

            <div class="settings-section">
              <div class="field-label-row"><span class="field-label">输出</span><span class="field-value">${isImageOut ? '图片' : isAudioOut ? '音频' : '视频'}</span></div>
              <div class="field-grid">
                ${isImageOut ? '' : isAudioOut ? fieldSelect('音频编码', 'edit.audioCodec', state.edit.audioCodec, [['auto', '跟随格式'], ['aac', 'AAC'], ['mp3', 'MP3'], ['opus', 'Opus'], ['flac', 'FLAC']]) : fieldSelect('音频编码', 'edit.audioCodec', state.edit.audioCodec, [['auto', '跟随格式'], ['aac', 'AAC'], ['mp3', 'MP3'], ['opus', 'Opus'], ['copy', '直接复制']])}
                ${isAudioOut || isImageOut ? '' : fieldSelect('编码预设', 'edit.preset', state.edit.preset, [['veryfast', '很快'], ['fast', '快'], ['medium', '均衡'], ['slow', '慢速']])}
                <div class="field field-full"><label>输出文件名（不含扩展名）</label><input class="input" type="text" data-bind="edit.outputName" value="${attr(state.edit.outputName)}" placeholder="留空则自动命名"></div>
              </div>
            </div>
          </div>

          <div class="settings-command">
            <div class="command-head"><span>${icon('terminal')} FFmpeg 命令预览</span><button type="button" data-action="copy-command">复制命令</button></div>
            <div class="command-box" id="command-preview">正在生成命令…</div>
          </div>

          <div class="settings-footer">
            <div class="settings-footer-summary"><span>${isImageOut ? '输出' : '输出片段'} <strong>${isImageOut ? '单帧' : fmtDuration(outputLength, true)}</strong></span><span>${isImageOut ? fmt.toUpperCase() : isAudioOut ? '提取音频' : fmt.toUpperCase()}</span></div>
            <div class="edit-actions" style="padding:0;border:0;background:none">
              <button class="btn btn-primary" type="button" data-action="start-edit">${icon(isImageOut ? 'image' : 'play')}${isImageOut ? '导出单帧' : '开始剪辑导出'}</button>
            </div>
          </div>
        </aside>
      </div>`;
  }

  /* ============================== Inspect ============================== */

  function renderInspect() {
    const media = activeMedia();
    if (!media) {
      return `${pageHead('Inspect', '媒体信息', '查看完整的容器、视频流与音频流参数。', `<button class="btn btn-primary" type="button" data-action="pick-files">${icon('plus')}导入素材</button>`)}
        <section class="panel"><div class="empty-state" style="padding:80px 24px;border:0">
          <div class="empty-icon">${icon('scan')}</div>
          <h3>还没有可检查的素材</h3>
          <p>导入文件后，这里会显示 ffprobe 读取到的全部流信息和原始 JSON。</p>
          <button class="btn btn-primary" type="button" data-action="pick-files">${icon('upload')}选择文件</button>
        </div></section>`;
    }
    const summary = media.summary || {};
    const probe = media.probe || {};
    const streams = Array.isArray(probe.streams) ? probe.streams : [];
    const kind = media.kind || summary.kind || 'video';
    const preview = kind === 'image'
      ? `<img src="${attr(media.fileUrl)}" alt="${attr(media.name)}">`
      : kind === 'audio'
        ? `<img src="${attr(media.thumbUrl)}" alt="" style="object-fit:contain;opacity:.9">`
        : `<video controls preload="metadata" poster="${attr(media.thumbUrl)}" src="${attr(media.fileUrl)}"></video>`;
    const streamRows = streams.map((stream) => {
      const type = stream.codec_type || 'data';
      const typeIcon = type === 'video' ? 'film' : type === 'audio' ? 'music' : type === 'subtitle' ? 'text' : 'layers';
      let detail = stream.codec_long_name || stream.codec_name || '—';
      if (type === 'video') detail += ` · ${stream.width || 0}×${stream.height || 0}`;
      if (type === 'audio') detail += ` · ${stream.sample_rate || 0} Hz · ${stream.channels || 0} 声道`;
      if (stream.tags?.language) detail += ` · ${stream.tags.language}`;
      const bitrate = stream.bit_rate ? fmtBitrate(stream.bit_rate) : '—';
      return `<tr>
        <td><span class="stream-type">${icon(typeIcon)}${esc(type)}</span></td>
        <td class="mono">${esc(stream.codec_name || '—')}</td>
        <td style="color:var(--muted)">${esc(detail)}</td>
        <td class="mono" style="color:var(--faint)">${esc(bitrate)}</td>
      </tr>`;
    }).join('');
    const tags = Object.entries(probe.format?.tags || {}).slice(0, 8);
    return `
      ${pageHead('Inspect', '媒体信息', '由 ffprobe 直接读取容器与所有流。可以复制原始 JSON，或带着这个文件继续转换和剪辑。', `
        <button class="btn" type="button" data-action="pick-files">${icon('plus')}导入素材</button>
        <button class="btn btn-primary" type="button" data-action="start-workflow">${icon('swap')}用此文件转换</button>
      `)}
      <div class="inspect-layout">
        <aside class="inspect-side">
          <section class="panel inspect-preview">
            <div class="panel-head"><h2>${icon(kindIcon(kind))}${kindLabel(kind)}预览</h2><span class="badge">${esc(media.ext.replace('.', '').toUpperCase() || 'FILE')}</span></div>
            <div class="inspect-media" style="margin-top:12px">${preview}</div>
            <div class="inspect-side-body">
              <div class="inspect-file-name">${esc(media.name)}</div>
              <div class="inspect-file-meta">
                <span class="badge">${fmtBytes(media.size)}</span>
                <span class="badge">${fmtDuration(summary.duration || 0)}</span>
                ${summary.width ? `<span class="badge">${summary.width}×${summary.height}</span>` : ''}
                <span class="badge">${esc(summary.videoCodec || summary.audioCodec || 'unknown')}</span>
              </div>
              <div class="inspect-actions">
                <a class="btn btn-sm" href="${attr(media.fileUrl)}" download="${attr(media.name)}">${icon('download')}原文件</a>
                <button class="btn btn-sm" type="button" data-action="go-edit">${icon('scissors')}剪辑</button>
                <button class="btn btn-sm btn-danger" type="button" data-action="remove-media" data-id="${attr(media.id)}">${icon('trash')}</button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>${icon('list')}选择素材</h2><span class="section-note">${state.media.length} 个</span></div>
            <div class="panel-body" style="padding-top:12px">
              <select class="select" data-media-select aria-label="选择素材">
                ${state.media.map((m) => `<option value="${attr(m.id)}" ${m.id === media.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}
              </select>
            </div>
          </section>
        </aside>

        <div class="inspect-main">
          <section class="panel">
            <div class="panel-head"><h2>${icon('gauge')}核心参数</h2><span class="badge badge-mono">${esc(summary.formatName || '')}</span></div>
            <div class="panel-body">
              <div class="detail-grid">
                ${detailItem('时长', fmtDuration(summary.duration || 0, true))}
                ${detailItem('文件大小', fmtBytes(media.size))}
                ${detailItem('总码率', fmtBitrate(summary.bitrate))}
                ${detailItem('分辨率', summary.width ? `${summary.width} × ${summary.height}` : '—')}
                ${detailItem('帧率', summary.fps ? `${summary.fps} fps` : '—')}
                ${detailItem('视频编码', summary.videoCodec || '—')}
                ${detailItem('音频编码', summary.audioCodec || '—')}
                ${detailItem('采样率', summary.sampleRate ? `${summary.sampleRate} Hz` : '—')}
                ${detailItem('声道', summary.audioChannels ? `${summary.audioChannels} · ${summary.audioChannelLayout || ''}` : '—')}
              </div>
              ${tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:13px">${tags.map(([k, v]) => `<span class="chip">${esc(k)}: ${esc(String(v).slice(0, 40))}</span>`).join('')}</div>` : ''}
            </div>
          </section>

          <section class="panel">
            <div class="panel-head"><h2>${icon('layers')}流结构</h2><span class="section-note">${streams.length} 条流</span></div>
            <div class="panel-body" style="overflow-x:auto">
              <table class="stream-table">
                <thead><tr><th>类型</th><th>编码</th><th>详情</th><th>码率</th></tr></thead>
                <tbody>${streamRows || `<tr><td colspan="4" style="color:var(--faint)">没有读取到流信息</td></tr>`}</tbody>
              </table>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head"><h2>${icon('terminal')}原始 ffprobe JSON</h2><button class="link-btn" type="button" data-action="copy-json">${icon('copy')}复制 JSON</button></div>
            <div class="panel-body">
              <details class="raw-details">
                <summary>展开完整 JSON · ${Object.keys(probe).length} 个顶层字段</summary>
                <pre class="raw-json" id="raw-json">${esc(JSON.stringify(probe, null, 2))}</pre>
              </details>
            </div>
          </section>
        </div>
      </div>`;
  }

  function detailItem(label, value) {
    return `<div class="detail-item"><span>${esc(label)}</span><strong title="${attr(value)}">${esc(value)}</strong></div>`;
  }

  /* ============================== Jobs ============================== */

  function jobCounts() {
    const counts = { all: state.jobs.length, queued: 0, running: 0, completed: 0, failed: 0, canceled: 0 };
    state.jobs.forEach((job) => { counts[job.status] = (counts[job.status] || 0) + 1; });
    return counts;
  }

  function renderJobs() {
    return `${pageHead('Queue', '任务队列', '所有编码任务都在后台顺序执行。点击任意任务查看完整日志、命令行和输出文件。', `
      <button class="btn" type="button" data-action="open-output">${icon('folderOpen')}输出目录</button>
      <button class="btn btn-primary" type="button" data-action="refresh-jobs">${icon('refresh')}刷新任务</button>
    `)}
    <div id="jobs-live">${renderJobsContent()}</div>`;
  }

  function renderJobsContent() {
    const counts = jobCounts();
    const filtered = state.jobFilter === 'all' ? state.jobs : state.jobs.filter((job) => job.status === state.jobFilter);
    const active = counts.running + counts.queued;
    const completed = state.jobs.filter((j) => j.status === 'completed');
    const totalOut = completed.reduce((sum, job) => sum + (job.outputSize || 0), 0);
    const filters = [
      ['all', '全部', counts.all],
      ['running', '处理中', counts.running],
      ['queued', '排队', counts.queued],
      ['completed', '已完成', counts.completed],
      ['failed', '失败', counts.failed],
      ['canceled', '已取消', counts.canceled]
    ];
    return `
      <div class="jobs-summary">
        ${statCard('全部任务', counts.all, 'list', `失败 ${counts.failed} 个`, '')}
        ${statCard('进行中', active, 'gauge', counts.running ? '编码正在写入磁盘' : '当前队列空闲', active ? 'amber' : 'accent')}
        ${statCard('已完成', counts.completed, 'checkCircle', `累计输出 ${fmtBytes(totalOut)}`, 'accent')}
        ${statCard('输出体积', fmtBytes(totalOut, 1), 'hardDrive', '所有已完成任务', '')}
      </div>
      <section class="panel">
        <div class="jobs-toolbar">
          <div class="filter-pills">
            ${filters.map(([key, label, count]) => `<button class="filter-pill ${state.jobFilter === key ? 'active' : ''}" type="button" data-action="set-job-filter" data-filter="${key}">${label}<span class="count">${count}</span></button>`).join('')}
          </div>
          <span class="section-note">自动刷新 · ${counts.running ? '正在处理' : '空闲'}</span>
        </div>
        ${filtered.length ? `<div class="jobs-list">${filtered.map(renderJobItem).join('')}</div>` : `
          <div class="empty-state" style="padding:56px 24px;border:0">
            <div class="empty-icon">${icon('list')}</div>
            <h3>${state.jobs.length ? '这个筛选条件下没有任务' : '队列还是空的'}</h3>
            <p>${state.jobs.length ? '换一个筛选条件，或者回到工作台发起新的任务。' : '从格式转换或剪辑工坊开始，任务会实时出现在这里。'}</p>
            <button class="btn btn-primary" type="button" data-action="start-workflow">${icon('swap')}开始转换</button>
          </div>`}
        <div class="jobs-foot"><span>共 ${filtered.length} 条记录</span><span>输出目录：data/outputs</span></div>
      </section>`;
  }

  function renderJobItem(job) {
    const kind = mediaKindForJob(job);
    const isActive = ['running', 'queued'].includes(job.status);
    const progress = Math.max(0, Math.min(100, Number(job.progress) || 0));
    return `<div class="job-item" data-action="open-job" data-id="${attr(job.id)}" title="${attr(job.error || job.commandText)}">
      <div class="job-item-name">
        <span class="job-file-icon">${icon(kindIcon(kind))}</span>
        <div class="job-name">${esc(job.outputName || job.inputName)}<small>${esc(job.inputName)} · ${job.operation === 'edit' ? '剪辑导出' : '格式转换'}</small></div>
      </div>
      <div>${statusPill(job.status)}</div>
      <div class="job-progress-cell">
        <div class="job-progress-label"><b>${isActive ? Math.round(progress) + '%' : job.status === 'completed' ? '100%' : '—'}</b><span>${job.status === 'running' ? (job.eta ? '约 ' + fmtDuration(job.eta) : '') : job.status === 'failed' ? '中断' : ''}</span></div>
        <div class="job-progress-bar ${esc(job.status)}"><span style="width:${job.status === 'completed' ? 100 : progress}%"></span></div>
      </div>
      <div class="job-cell job-size">${job.status === 'completed' ? fmtBytes(job.outputSize) : fmtBytes(job.outputSize || 0)}<small>${job.status === 'running' && job.speed ? job.speed.toFixed(2) + '×' : '输出体积'}</small></div>
      <div class="job-cell job-created">${fmtDate(job.createdAt)}<small>${timeAgo(job.createdAt)}</small></div>
      <div class="job-actions">
        ${job.status === 'completed' ? `<a class="icon-btn" href="${attr(job.downloadUrl)}" title="下载输出" data-no-row>${icon('download')}</a>` : ''}
        ${job.status === 'running' || job.status === 'queued' ? `<button class="icon-btn danger" type="button" data-action="cancel-job" data-id="${attr(job.id)}" title="取消任务">${icon('x')}</button>` : ''}
        <button class="icon-btn" type="button" data-action="open-job" data-id="${attr(job.id)}" title="查看详情">${icon('arrowRight')}</button>
      </div>
    </div>`;
  }

  async function openJobModal(id) {
    let job = state.jobs.find((item) => item.id === id);
    if (!job) return;
    state.jobDetailId = id;
    try {
      const data = await api(`/api/jobs/${encodeURIComponent(id)}`);
      if (data?.job) {
        job = data.job;
        const index = state.jobs.findIndex((item) => item.id === id);
        if (index >= 0) state.jobs[index] = job;
        state.knownStatuses.set(job.id, job.status);
      }
    } catch {}
    if (state.jobDetailId !== id) return;
    const root = $('#modal-root');
    if (!root) return;
    root.hidden = false;
    root.innerHTML = renderJobModal(job);
    hydrateIcons(root);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const root = $('#modal-root');
    if (!root) return;
    root.hidden = true;
    root.innerHTML = '';
    state.jobDetailId = null;
    document.body.style.overflow = '';
  }

  function renderJobModal(job) {
    const progress = Math.max(0, Math.min(100, Number(job.progress) || 0));
    const logs = (job.logs || []).join('\n') || '暂无日志输出。';
    return `<div class="modal" role="dialog" aria-modal="true" aria-label="任务详情" data-status="${attr(job.status)}">
      <div class="modal-head">
        <div class="modal-title">
          <span class="modal-title-icon">${icon(job.status === 'failed' ? 'alert' : job.status === 'completed' ? 'checkCircle' : 'loader')}</span>
          <div><h2>${esc(job.outputName || job.inputName)}</h2><p>${esc(job.operation === 'edit' ? '剪辑导出' : '格式转换')} · ${esc(job.id.slice(0, 8))} · ${timeAgo(job.createdAt)}</p></div>
        </div>
        <button class="icon-btn modal-close" type="button" data-action="close-modal" aria-label="关闭">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="job-progress-large">
          <div class="job-progress-label"><span>${statusPill(job.status)}</span><b>${job.status === 'completed' ? '100%' : Math.round(progress) + '%'}</b></div>
          <div class="job-progress-bar ${esc(job.status)}" style="height:6px"><span style="width:${job.status === 'completed' ? 100 : progress}%"></span></div>
        </div>
        ${job.error ? `<div class="test-result fail" style="margin-bottom:14px;color:var(--danger);font-size:10px;line-height:1.6">${icon('alert')} ${esc(job.error)}</div>` : ''}
        <div class="modal-grid">
          <div class="modal-stat"><span>输入文件</span><strong>${esc(job.inputName)}</strong></div>
          <div class="modal-stat"><span>输出文件</span><strong>${esc(job.outputName || '—')}</strong></div>
          <div class="modal-stat"><span>输出体积</span><strong>${job.outputSize ? fmtBytes(job.outputSize) : '—'}</strong></div>
          <div class="modal-stat"><span>处理速度 / 耗时</span><strong>${job.speed ? job.speed.toFixed(2) + '×' : '—'}${job.finishedAt && job.startedAt ? ' · ' + fmtDuration((new Date(job.finishedAt) - new Date(job.startedAt)) / 1000) : ''}</strong></div>
          <div class="modal-stat"><span>源时长</span><strong>${fmtDuration(job.duration, true)}</strong></div>
          <div class="modal-stat"><span>已处理</span><strong>${fmtDuration(job.processedSeconds || 0, true)}</strong></div>
        </div>
        <div class="modal-section-title"><span>${icon('terminal')} FFmpeg 命令行</span><button class="link-btn" type="button" data-action="copy-command">${icon('copy')}复制</button></div>
        <div class="command-box" id="command-preview" style="max-height:110px;color:#91a2b5">${esc(job.commandText || '—')}</div>
        <div class="modal-section-title"><span>${icon('list')} 运行日志</span><button class="link-btn" type="button" data-action="copy-logs" data-id="${attr(job.id)}">${icon('copy')}复制日志</button></div>
        <div class="modal-log" id="job-modal-log">${esc(logs)}</div>
      </div>
      <div class="modal-foot">
        <button class="btn" type="button" data-action="close-modal">关闭</button>
        ${!['running', 'queued'].includes(job.status) ? `<button class="btn btn-danger" type="button" data-action="delete-job" data-id="${attr(job.id)}">${icon('trash')}删除记录</button>` : ''}
        ${['running', 'queued'].includes(job.status) ? `<button class="btn btn-danger" type="button" data-action="cancel-job" data-id="${attr(job.id)}">${icon('x')}取消任务</button>` : ''}
        ${job.status === 'completed' ? `<button class="btn" type="button" data-action="reveal-job" data-id="${attr(job.id)}">${icon('folderOpen')}打开文件夹</button><a class="btn btn-primary" href="${attr(job.downloadUrl)}">${icon('download')}下载输出</a>` : ''}
      </div>
    </div>`;
  }

  /* ============================== System ============================== */

  function renderSystem() {
    const system = state.system || {};
    const ffmpeg = system.ffmpeg || {};
    const caps = system.capabilities || {};
    const encoders = caps.encoders || {};
    const hardware = caps.hardware || {};
    const version = shortVersion(ffmpeg.version);
    const tests = [
      ['libx264', 'H.264', 'libx264'],
      ['libx265', 'H.265', 'libx265'],
      ['libsvtav1', 'AV1', 'libsvtav1'],
      ['libaom-av1', 'AV1 (AOM)', 'libaom-av1'],
      ['libvpx-vp9', 'VP9', 'libvpx-vp9'],
      ['aac', 'AAC', 'aac'],
      ['libmp3lame', 'MP3', 'libmp3lame'],
      ['libopus', 'Opus', 'libopus'],
      ['libvorbis', 'Vorbis', 'libvorbis'],
      ['flac', 'FLAC', 'flac'],
      ['libwebp', 'WebP', 'libwebp'],
      ['libxvid', 'Xvid', 'libxvid']
    ];
    const selftest = state.selftest;
    return `
      ${pageHead('Engine', '引擎与设置', 'FFmpeg Studio 使用本地原生二进制，不依赖云端。这里可以确认版本、编码器和运行环境。', `
        <button class="btn" type="button" data-action="refresh-system">${icon('refresh')}刷新状态</button>
        <button class="btn btn-primary" type="button" data-action="run-selftest" ${state.selftestRunning ? 'disabled' : ''}>${icon(state.selftestRunning ? 'loader' : 'zap')}${state.selftestRunning ? '自检中…' : '运行自检'}</button>
      `)}
      <section class="system-hero">
        <div class="system-hero-copy">
          <div class="page-eyebrow" style="margin-bottom:5px">Local native engine</div>
          <div class="system-version"><h1>FFmpeg ${esc(version)}</h1><span class="badge badge-accent">${ffmpeg.available ? 'ONLINE' : 'OFFLINE'}</span></div>
          <p class="system-desc">当前内置 <strong style="color:var(--text-soft)">9.1</strong>，2026-11-20 发布。essentials build 包含 H.264 / H.265 / AV1 / VP9 编码器与常用音频编码器。</p>
          <div class="system-meta">
            <span class="chip"><i></i>${ffmpeg.available ? '可执行' : '不可执行'}</span>
            <span class="chip"><i></i>GPL v3</span>
            <span class="chip"><i></i>${esc(system.app?.arch || 'x64')}</span>
            <span class="chip"><i></i>Node ${esc(system.app?.node || '—')}</span>
            <span class="chip"><i></i>${Object.keys(encoders).length} 个编码器</span>
          </div>
          <div class="system-hero-actions">
            <button class="btn btn-primary" type="button" data-action="run-selftest" ${state.selftestRunning ? 'disabled' : ''}>${icon('zap')}验证编码链路</button>
            <button class="btn" type="button" data-action="open-output">${icon('folderOpen')}打开输出目录</button>
            <a class="btn" href="https://ffmpeg.org/download.html" target="_blank" rel="noreferrer">${icon('external')}FFmpeg 官网</a>
          </div>
        </div>
        <div class="system-side">
          <div class="sys-binary"><span>FFmpeg 可执行文件</span><code title="${attr(ffmpeg.binary)}">${esc(ffmpeg.binary || '—')}</code></div>
          <div class="sys-binary"><span>ffprobe 可执行文件</span><code title="${attr(ffmpeg.probeBinary)}">${esc(ffmpeg.probeBinary || '—')}</code></div>
          <div class="sys-binary"><span>工作目录</span><code title="${attr(system.app?.dataDir)}">${esc(system.app?.dataDir || '—')}</code></div>
        </div>
      </section>

      ${selftest ? `<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>${icon(selftest.ok ? 'checkCircle' : 'alert')}最近一次自检</h2><span class="badge ${selftest.ok ? 'badge-accent' : 'badge-danger'}">${selftest.ok ? '通过' : '失败'}</span></div><div class="panel-body">
        <div class="test-result ${selftest.ok ? 'ok' : 'fail'}">
          ${selftest.ok ? `生成 2 秒测试视频并完成 H.264 + AAC 编码，用时 ${selftest.elapsedMs} ms，输出 ${fmtBytes(selftest.size)}。` : esc(selftest.error || '自检失败')}
          ${selftest.ok ? `<div class="test-checks">${selftest.checks.map((c) => `<span class="test-check">${icon('check')}${esc(c.name)}</span>`).join('')}</div>` : ''}
        </div>
      </div></section>` : ''}

      <div class="system-grid">
        <section class="panel">
          <div class="panel-head"><h2>${icon('cpu')}编码器矩阵</h2><span class="section-note">检测到 ${Object.keys(encoders).length} 个</span></div>
          <div class="panel-body"><div class="cap-grid">
            ${tests.map(([key, label]) => `<span class="chip ${encoders[key] ? '' : 'off'}" title="${key}"><i></i>${label}</span>`).join('')}
          </div>
          <div class="divider"></div>
          <div class="cap-grid">
            <span class="chip"><i></i>${Object.keys(caps.filters || {}).length} 个滤镜</span>
            <span class="chip"><i></i>${(caps.hwaccels || []).length} 个硬件接口</span>
            <span class="chip"><i></i>${esc(ffmpeg.configuration?.includes('enable-gpl') ? 'GPL 构建' : 'LGPL 构建')}</span>
          </div></div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${icon('zap')}硬件加速</h2><span class="section-note">按编译支持检测</span></div>
          <div class="panel-body">
            <div class="hw-grid">
              ${hwCard('NVIDIA NVENC', hardware.nvidia, 'h264_nvenc / hevc_nvenc')}
              ${hwCard('Intel Quick Sync', hardware.intel, 'h264_qsv / hevc_qsv')}
              ${hwCard('AMD AMF', hardware.amd, 'h264_amf / hevc_amf')}
            </div>
            <p class="text-10 muted" style="margin-top:11px;line-height:1.65">编码器存在只表示 FFmpeg 编译了对应接口。实际能否使用还取决于显卡型号、驱动和当前会话。转码失败时请切回 CPU 编码。</p>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${icon('hardDrive')}运行环境</h2><span class="section-note">本地服务</span></div>
          <div class="panel-body">
            <div class="sys-list">
              <div class="sys-row"><span class="sys-row-label">${icon('terminal')}平台</span><span class="sys-row-value">${esc(system.app?.platform || '—')} / ${esc(system.app?.arch || '—')}</span></div>
              <div class="sys-row"><span class="sys-row-label">${icon('cpu')}Node.js</span><span class="sys-row-value">${esc(system.app?.node || '—')}</span></div>
              <div class="sys-row"><span class="sys-row-label">${icon('hardDrive')}磁盘剩余</span><span class="sys-row-value">${fmtBytes(system.disk?.free)} / ${fmtBytes(system.disk?.total)}</span></div>
              <div class="sys-row"><span class="sys-row-label">${icon('gauge')}任务并发</span><span class="sys-row-value">${system.app?.concurrency || 1}</span></div>
              <div class="sys-row"><span class="sys-row-label">${icon('clock')}运行时长</span><span class="sys-row-value">${fmtDuration(system.app?.uptime || 0)}</span></div>
              <div class="sys-row"><span class="sys-row-label">${icon('list')}任务总数</span><span class="sys-row-value">${system.counts?.jobs ?? state.jobs.length}</span></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${icon('info')}关于与许可</h2><span class="badge">v${esc(system.app?.version || '1.0.1')}</span></div>
          <div class="panel-body">
            <p class="text-10 muted" style="line-height:1.75;margin-bottom:13px">FFmpeg Studio 是一个本地优先的可视化界面。UI/交互设计参考了开源项目 <strong>dinoosauro/ffmpeg-web</strong>（MIT），并针对原生 FFmpeg 9 与 Windows 本地文件工作流重新实现。</p>
            <div class="about-links">
              <a class="about-link" href="https://github.com/dinoosauro/ffmpeg-web" target="_blank" rel="noreferrer"><span>${icon('external')}dinoosauro/ffmpeg-web · UI 参考</span><span>MIT</span></a>
              <a class="about-link" href="https://ffmpeg.org/" target="_blank" rel="noreferrer"><span>${icon('external')}FFmpeg 项目主页</span><span>GPL / LGPL</span></a>
              <a class="about-link" href="https://www.gyan.dev/ffmpeg/builds/" target="_blank" rel="noreferrer"><span>${icon('external')}gyan.dev Windows 构建</span><span>9.1</span></a>
              <a class="about-link" href="https://github.com/GyanD/codexffmpeg/releases/tag/9.1" target="_blank" rel="noreferrer"><span>${icon('external')}发布包与校验信息</span><span>2026-11-20</span></a>
            </div>
            <p class="text-10 faint" style="margin-top:12px">本软件不收集任何数据。上传与输出文件都保存在本机 data 目录。</p>
          </div>
        </section>
      </div>

      <section class="panel" style="margin-top:16px">
        <div class="panel-head"><h2>${icon('terminal')}构建信息</h2><span class="section-note">只读</span></div>
        <div class="panel-body">
          <details class="raw-details"><summary>查看 FFmpeg configuration 与二进制路径</summary>
            <pre class="raw-json" style="max-height:280px">${esc(`FFmpeg : ${ffmpeg.version || '—'}\nffprobe: ${system.ffprobe?.version || '—'}\n\n${ffmpeg.line || ''}\n\nconfiguration:\n${ffmpeg.configuration || '—'}`)}</pre>
          </details>
        </div>
      </section>`;
  }

  function hwCard(name, enabled, detail) {
    return `<div class="hw-card ${enabled ? 'on' : ''}"><div class="hw-head"><span>${esc(name)}</span><i></i></div><small>${enabled ? esc(detail) : '未编译 / 不可用'}</small></div>`;
  }

  /* ============================== Actions & events ============================== */

  async function handleAction(action, el, event) {
    if (!action) return;
    try {
      switch (action) {
        case 'pick-files':
          $('#file-input')?.click();
          break;
        case 'open-sidebar':
          openSidebar();
          break;
        case 'close-sidebar':
          closeSidebar();
          break;
        case 'start-workflow':
          navigate('convert');
          break;
        case 'go-edit':
          if (!activeMedia()) {
            toast('还没有素材', '先导入一个文件，再进入剪辑工坊。', 'info');
            $('#file-input')?.click();
            break;
          }
          navigate('edit');
          break;
        case 'go-inspect':
          if (!activeMedia()) {
            toast('还没有素材', '先导入一个文件，再查看媒体信息。', 'info');
            $('#file-input')?.click();
            break;
          }
          navigate('inspect');
          break;
        case 'inspect-media':
          state.activeMediaId = el.dataset.id;
          navigate('inspect');
          break;
        case 'activate-media':
          if (event.target.closest('input,button,a')) break;
          setActiveMedia(el.dataset.id, true);
          break;
        case 'quick-preset':
          applyPreset(el.dataset.preset);
          break;
        case 'set-format': {
          const target = el.dataset.target === 'edit' ? 'edit' : 'convert';
          state[target].format = el.dataset.format;
          if (target === 'edit' && ['mp3', 'm4a', 'wav', 'flac', 'opus'].includes(el.dataset.format)) {
            state.edit.audioCodec = 'auto';
          }
          saveSettings();
          render();
          break;
        }
        case 'select-all':
          state.selectedMediaIds = new Set(state.media.map((m) => m.id));
          render();
          break;
        case 'select-none':
          state.selectedMediaIds.clear();
          render();
          break;
        case 'toggle-advanced':
          state.advancedOpen = !state.advancedOpen;
          render();
          break;
        case 'toggle-flip': {
          const key = el.dataset.dir === 'h' ? 'flipHorizontal' : 'flipVertical';
          state.edit[key] = !state.edit[key];
          el.classList.toggle('active', state.edit[key]);
          saveSettings();
          requestPreview(120);
          break;
        }
        case 'set-rotate':
          state.edit.rotate = el.dataset.deg || '0';
          saveSettings();
          render();
          break;
        case 'reset-edit': {
          const format = state.edit.format;
          state.edit = deepMerge(DEFAULT_EDIT, { format });
          state.edit.end = 0;
          saveSettings();
          render();
          toast('已重置编辑参数', '', 'success', 2200);
          break;
        }
        case 'start-convert':
          await submitConvert(el);
          break;
        case 'start-edit':
          await submitEdit(el);
          break;
        case 'open-output':
          await api('/api/open-output', { method: 'POST' });
          toast('已打开输出目录', 'data/outputs', 'success', 2200);
          break;
        case 'copy-command': {
          let text = state.lastCommand || '';
          if (state.jobDetailId) {
            const job = state.jobs.find((j) => j.id === state.jobDetailId);
            text = job?.commandText || $('#command-preview')?.textContent || text;
          } else {
            text = $('#command-preview')?.textContent || text;
          }
          await copyText(text);
          toast('FFmpeg 命令已复制', '', 'success', 2200);
          break;
        }
        case 'copy-json': {
          const json = $('#raw-json')?.textContent || '';
          await copyText(json);
          toast('ffprobe JSON 已复制', '', 'success', 2200);
          break;
        }
        case 'copy-logs': {
          const job = state.jobs.find((j) => j.id === el.dataset.id);
          await copyText((job?.logs || []).join('\n'));
          toast('运行日志已复制', '', 'success', 2200);
          break;
        }
        case 'open-job':
          openJobModal(el.dataset.id);
          break;
        case 'close-modal':
          closeModal();
          break;
        case 'cancel-job': {
          event.stopPropagation();
          const job = state.jobs.find((j) => j.id === el.dataset.id);
          if (!job) break;
          if (!window.confirm(`确定取消任务“${job.outputName || job.inputName}”吗？`)) break;
          await api(`/api/jobs/${encodeURIComponent(job.id)}/cancel`, { method: 'POST' });
          toast('已请求取消任务', '', 'info');
          await refreshJobs(false);
          break;
        }
        case 'delete-job': {
          const job = state.jobs.find((j) => j.id === el.dataset.id);
          if (!job) break;
          if (!window.confirm(`删除任务记录“${job.outputName || job.inputName}”？（不会删除输出文件）`)) break;
          await api(`/api/jobs/${encodeURIComponent(job.id)}`, { method: 'DELETE' });
          if (state.jobDetailId === job.id) closeModal();
          await refreshJobs(false);
          toast('任务记录已删除', '', 'success');
          break;
        }
        case 'reveal-job':
          await api(`/api/jobs/${encodeURIComponent(el.dataset.id)}/reveal`, { method: 'POST' });
          toast('已在资源管理器中定位输出文件', '', 'success', 2400);
          break;
        case 'set-job-filter':
          state.jobFilter = el.dataset.filter || 'all';
          updateJobsLive();
          break;
        case 'refresh-jobs':
          await refreshJobs(true);
          toast('任务列表已刷新', '', 'success', 1800);
          break;
        case 'remove-media':
          await removeMedia(el.dataset.id);
          break;
        case 'run-selftest':
          await runSelftest();
          break;
        case 'refresh-system':
          await refreshSystem(true);
          break;
        default:
          break;
      }
    } catch (error) {
      toast('操作失败', error.message || String(error), 'error', 6000);
      const startBtn = el.closest('[data-action^="start"]');
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = `${icon(startBtn.dataset.action === 'start-edit' ? 'play' : 'play')}${startBtn.dataset.action === 'start-edit' ? '开始剪辑导出' : '开始转换'}`;
      }
    }
  }

  function applyPreset(preset) {
    if (preset === 'mp4') {
      state.convert.format = 'mp4';
      state.convert.videoCodec = 'auto';
      state.convert.crf = 22;
      state.convert.audioCodec = 'auto';
    } else if (preset === 'hevc') {
      state.convert.format = 'mp4';
      state.convert.videoCodec = 'hevc';
      state.convert.crf = 24;
      state.convert.audioCodec = 'auto';
    } else if (preset === 'mp3') {
      state.convert.format = 'mp3';
      state.convert.audioCodec = 'auto';
      state.convert.audioBitrate = 192;
    } else if (preset === 'gif') {
      state.convert.format = 'gif';
      state.convert.gifFps = 12;
      state.convert.gifWidth = 640;
    }
    saveSettings();
    navigate('convert');
    setTimeout(() => toast('已套用预设', preset === 'mp3' ? '提取 MP3 音频' : preset === 'gif' ? '高品质 GIF' : preset.toUpperCase(), 'success', 2200), 120);
  }

  function setActiveMedia(id, resetRange = false) {
    if (!state.media.some((m) => m.id === id)) return;
    const changed = state.activeMediaId !== id;
    state.activeMediaId = id;
    if (changed || resetRange) {
      state.edit.start = 0;
      state.edit.end = 0;
    }
    saveSettings();
    render();
  }

  async function removeMedia(id) {
    const media = state.media.find((m) => m.id === id);
    if (!media) return;
    if (!window.confirm(`从工作区移除“${media.name}”？\n对应上传文件也会被删除，但已导出的任务文件会保留。`)) return;
    await api(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
    state.media = state.media.filter((m) => m.id !== id);
    state.selectedMediaIds.delete(id);
    if (state.activeMediaId === id) state.activeMediaId = state.media[0]?.id || null;
    state.edit.start = 0;
    state.edit.end = 0;
    updateNavCounts();
    render();
    toast('素材已移除', media.name, 'success');
  }

  async function submitConvert(button) {
    const mediaIds = [...state.selectedMediaIds].filter((id) => state.media.some((m) => m.id === id));
    if (!mediaIds.length) {
      toast('没有选中素材', '请先在队列中勾选要转换的文件。', 'error');
      return;
    }
    if (!state.system?.ffmpeg?.available) {
      toast('FFmpeg 不可用', '请检查 ffmpeg/bin/ffmpeg.exe 是否存在。', 'error', 6000);
      return;
    }
    button.disabled = true;
    const original = button.innerHTML;
    button.innerHTML = `${icon('loader')}正在加入队列…`;
    try {
      const result = await api('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ mediaIds, operation: 'convert', settings: state.convert })
      });
      toast('已加入任务队列', `${result.jobs.length} 个转换任务开始排队`, 'success');
      await refreshJobs(false);
      navigate('jobs');
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  }

  async function submitEdit(button) {
    const media = activeMedia();
    if (!media) {
      toast('没有可编辑的素材', '请先导入文件。', 'error');
      return;
    }
    if (!state.system?.ffmpeg?.available) {
      toast('FFmpeg 不可用', '请检查 ffmpeg/bin/ffmpeg.exe 是否存在。', 'error', 6000);
      return;
    }
    normalizeEditRange(media);
    button.disabled = true;
    const original = button.innerHTML;
    button.innerHTML = `${icon('loader')}正在加入队列…`;
    try {
      const result = await api('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ mediaIds: [media.id], operation: 'edit', settings: state.edit })
      });
      toast('剪辑任务已提交', result.jobs[0]?.outputName || '', 'success');
      await refreshJobs(false);
      navigate('jobs');
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  }

  async function runSelftest() {
    if (state.selftestRunning) return;
    state.selftestRunning = true;
    state.selftest = null;
    if (state.route === 'system') render();
    else toast('开始自检', '正在生成测试视频并调用编码器…', 'info');
    try {
      const result = await api('/api/selftest', { method: 'POST', body: '{}' });
      state.selftest = result;
      if (result.ok) toast('自检通过', `H.264 + AAC 编码链路正常 · ${result.elapsedMs} ms`, 'success');
      else toast('自检失败', result.error || '请查看系统设置', 'error', 8000);
    } catch (error) {
      state.selftest = { ok: false, error: error.message };
      toast('自检失败', error.message, 'error', 8000);
    } finally {
      state.selftestRunning = false;
      if (state.route === 'system') render();
    }
  }

  async function refreshSystem(manual = false) {
    try {
      state.system = await api('/api/system');
      updateEngineUI();
      if (state.route === 'system') render();
      if (manual) toast('引擎状态已刷新', '', 'success', 1800);
    } catch (error) {
      toast('刷新失败', error.message, 'error');
    }
  }

  async function refreshMedia() {
    const data = await api('/api/media');
    const previous = new Set(state.media.map((m) => m.id));
    state.media = data.media || [];
    const currentSelected = new Set([...state.selectedMediaIds].filter((id) => state.media.some((m) => m.id === id)));
    state.media.forEach((m) => { if (!previous.has(m.id)) currentSelected.add(m.id); });
    state.selectedMediaIds = currentSelected;
    if (!state.media.some((m) => m.id === state.activeMediaId)) state.activeMediaId = state.media[0]?.id || null;
    updateNavCounts();
    return state.media;
  }

  async function refreshJobs(notify = false) {
    try {
      const data = await api('/api/jobs?limit=100');
      const changed = applyJobs(data.jobs || [], notify);
      if (changed && state.route === 'dashboard') render();
      return changed;
    } catch (error) {
      if (notify) throw error;
    }
    return false;
  }

  function applyJobs(jobs, notify = false) {
    let transitioned = false;
    let terminalEvent = null;
    for (const job of jobs) {
      const previous = state.knownStatuses.get(job.id);
      if (previous && previous !== job.status) {
        transitioned = true;
        if (['completed', 'failed'].includes(job.status) && previous !== job.status) terminalEvent = { job, previous };
      }
      state.knownStatuses.set(job.id, job.status);
    }
    state.jobs = jobs;
    updateEngineUI();
    updateNavCounts();
    if (state.route === 'jobs') updateJobsLive();
    if (state.jobDetailId) updateOpenJobModal();
    if (terminalEvent && notify) {
      const { job } = terminalEvent;
      if (job.status === 'completed') {
        toast('任务完成', `${job.outputName} · ${fmtBytes(job.outputSize)}`, 'success', 5000);
      } else if (job.status === 'failed') {
        toast('任务失败', (job.error || job.inputName).slice(0, 160), 'error', 7000);
      }
    }
    if (transitioned && state.route === 'dashboard') {
      // handled by caller to avoid replacing the dashboard while merely progressing
      return true;
    }
    return transitioned;
  }

  function updateJobsLive() {
    const live = $('#jobs-live');
    if (!live) return;
    live.innerHTML = renderJobsContent();
    hydrateIcons(live);
    syncRangeVisuals(live);
  }

  function updateOpenJobModal() {
    if (!state.jobDetailId) return;
    const job = state.jobs.find((j) => j.id === state.jobDetailId);
    if (!job) {
      closeModal();
      return;
    }
    const root = $('#modal-root');
    const modal = $('.modal', root);
    if (!modal) return;
    if (modal.dataset.status !== job.status) {
      root.innerHTML = renderJobModal(job);
      hydrateIcons(root);
      return;
    }
    const pct = job.status === 'completed' ? 100 : Math.max(0, Math.min(100, Number(job.progress) || 0));
    const bar = $('.job-progress-large .job-progress-bar span', modal);
    if (bar) bar.style.width = `${pct}%`;
    const label = $('.job-progress-large .job-progress-label b', modal);
    if (label) label.textContent = `${Math.round(pct)}%`;
    const log = $('#job-modal-log', modal);
    if (log) {
      const atBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 24;
      log.textContent = (job.logs || []).join('\n') || '暂无日志输出。';
      if (atBottom) log.scrollTop = log.scrollHeight;
    }
  }

  function scheduleJobPoll(delay = 1200) {
    clearTimeout(state.pollTimer);
    state.pollTimer = setTimeout(pollJobs, delay);
  }

  async function pollJobs() {
    if (state.jobPollBusy) {
      scheduleJobPoll(1200);
      return;
    }
    state.jobPollBusy = true;
    try {
      const data = await api('/api/jobs?limit=100');
      const changed = applyJobs(data.jobs || [], true);
      if (changed && state.route === 'dashboard') render();
    } catch {}
    state.jobPollBusy = false;
    const active = state.jobs.some((j) => ['running', 'queued'].includes(j.status));
    scheduleJobPoll(active ? 1000 : 3500);
  }

  function syncRangeVisuals(root = document) {
    $$('.range', root).forEach((range) => {
      const min = Number(range.min) || 0;
      const max = Number(range.max) || 100;
      const value = Number(range.value) || 0;
      const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
      range.style.setProperty('--fill', `${Math.max(0, Math.min(100, pct))}%`);
      const bind = range.dataset.bind;
      if (bind) {
        const output = $(`[data-output-for="${bind}"]`, root);
        if (output) output.textContent = `${range.dataset.decimals ? Number(value).toFixed(Number(range.dataset.decimals)) : value}${range.dataset.suffix || ''}`;
      }
    });
  }

  function updateRangeOutput(input, root = document) {
    const bind = input.dataset.bind;
    if (!bind) return;
    const value = input.value;
    $$(`[data-output-for="${bind}"]`, root).forEach((output) => {
      output.textContent = `${value}${input.dataset.suffix || ''}`;
    });
  }

  function updateTrimUI(changed = '') {
    const media = activeMedia();
    const duration = Number(media?.summary?.duration || 0);
    if (!media || duration <= 0) return;
    let start = Number($('#trim-start')?.value ?? state.edit.start);
    let end = Number($('#trim-end')?.value ?? state.edit.end);
    if (changed === 'start' && start >= end) end = Math.min(duration, start + 0.1);
    if (changed === 'end' && end <= start) start = Math.max(0, end - 0.1);
    if (start < 0) start = 0;
    if (end > duration) end = duration;
    if (end <= start) end = Math.min(duration, start + 0.1);
    state.edit.start = Math.round(start * 10) / 10;
    state.edit.end = Math.round(end * 10) / 10;
    const startInput = $('#trim-start');
    const endInput = $('#trim-end');
    if (startInput) startInput.value = state.edit.start;
    if (endInput) endInput.value = state.edit.end;
    const startPct = (state.edit.start / duration) * 100;
    const endPct = (state.edit.end / duration) * 100;
    const track = $('#trim-track');
    if (track) {
      track.style.setProperty('--left', `${startPct}%`);
      track.style.setProperty('--right', `${100 - endPct}%`);
    }
    const startThumb = $('#trim-thumb-start');
    const endThumb = $('#trim-thumb-end');
    if (startThumb) startThumb.style.left = `${startPct}%`;
    if (endThumb) endThumb.style.left = `${endPct}%`;
    const startOut = $('#trim-start-out');
    const endOut = $('#trim-end-out');
    if (startOut) startOut.textContent = fmtDuration(state.edit.start, true);
    if (endOut) endOut.textContent = fmtDuration(state.edit.end, true);
    const length = Math.max(0, (state.edit.end - state.edit.start) / (Number(state.edit.speed) || 1));
    const lengthEl = $('#edit-output-length');
    if (lengthEl) lengthEl.textContent = fmtDuration(length, true);
    if (startInput) syncRangeVisuals(document);
    saveSettings();
    requestPreview(120);
  }

  async function requestPreview(delay = 260) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(generatePreview, delay);
  }

  async function generatePreview() {
    if (!['convert', 'edit'].includes(state.route)) return;
    const box = $('#command-preview');
    if (!box) return;
    const media = activeMedia();
    if (!media) {
      box.textContent = 'ffmpeg -i <选择素材> …';
      state.lastCommand = '';
      return;
    }
    const seq = ++state.previewSeq;
    const operation = state.route === 'edit' ? 'edit' : 'convert';
    const settings = operation === 'edit' ? state.edit : state.convert;
    try {
      const result = await api('/api/preview', {
        method: 'POST',
        body: JSON.stringify({ mediaId: media.id, operation, settings })
      });
      if (seq !== state.previewSeq || !$('#command-preview')) return;
      box.textContent = result.commandText;
      state.lastCommand = result.commandText;
    } catch (error) {
      if (seq === state.previewSeq && $('#command-preview')) box.textContent = `无法生成命令：${error.message}`;
    }
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  function uploadFile(file) {
    return new Promise((resolve, reject) => {
      const seq = ++state.uploadCount;
      const id = `upload-${seq}`;
      const el = document.createElement('div');
      el.className = 'upload-item';
      el.id = id;
      el.innerHTML = `<div class="upload-item-top"><span class="upload-item-name">${esc(file.name)}</span><span class="upload-item-pct">0%</span></div><div class="upload-bar"><span></span></div>`;
      $('#upload-float')?.appendChild(el);
      const pctEl = $('.upload-item-pct', el);
      const bar = $('.upload-bar span', el);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (bar) bar.style.width = `${pct}%`;
      };
      xhr.onload = () => {
        let payload = null;
        try { payload = JSON.parse(xhr.responseText || '{}'); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) {
          if (pctEl) pctEl.textContent = '100%';
          if (bar) bar.style.width = '100%';
          el.classList.add('done');
          setTimeout(() => el.remove(), 1300);
          resolve(payload.media);
        } else {
          if (bar) bar.style.background = 'var(--danger)';
          if (pctEl) pctEl.textContent = '失败';
          setTimeout(() => el.remove(), 3000);
          reject(new Error(payload?.error || `上传失败 (${xhr.status})`));
        }
      };
      xhr.onerror = () => {
        if (bar) bar.style.background = 'var(--danger)';
        if (pctEl) pctEl.textContent = '网络错误';
        setTimeout(() => el.remove(), 3000);
        reject(new Error('上传连接中断'));
      };
      xhr.send(file);
    });
  }

  async function uploadFiles(files) {
    const list = [...files].filter(Boolean);
    if (!list.length) return;
    state.uploadActive += 1;
    let success = 0;
    let lastMedia = null;
    for (const file of list) {
      try {
        const media = await uploadFile(file);
        if (media) {
          lastMedia = media;
          state.media = [media, ...state.media.filter((m) => m.id !== media.id)];
          state.selectedMediaIds.add(media.id);
          state.activeMediaId = media.id;
          state.edit.start = 0;
          state.edit.end = 0;
          success += 1;
        }
      } catch (error) {
        toast('导入失败', `${file.name}：${error.message}`, 'error', 8000);
      }
    }
    state.uploadActive = Math.max(0, state.uploadActive - 1);
    if (success) {
      updateNavCounts();
      toast('素材已导入', `${success} 个文件已加入工作区`, 'success');
      if (state.route === 'dashboard') {
        navigate('convert');
      } else {
        render();
      }
    }
    if (!lastMedia && !success) {
      // Nothing to do; individual errors were already shown.
    }
  }

  function handleIncomingFiles(fileList) {
    const files = [...fileList].filter((file) => file && file.size >= 0);
    if (!files.length) return;
    uploadFiles(files);
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const nav = event.target.closest('.nav-item');
      if (nav) closeSidebar();
      if (event.target.closest('[data-no-row]')) return;
      const actionEl = event.target.closest('[data-action]');
      if (actionEl) {
        if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
        handleAction(actionEl.dataset.action, actionEl, event);
        return;
      }
      if (event.target === $('#modal-root')) closeModal();
    });

    document.addEventListener('change', (event) => {
      const target = event.target;
      if (target.matches('[data-select-media]')) {
        const id = target.dataset.selectMedia;
        if (target.checked) state.selectedMediaIds.add(id);
        else state.selectedMediaIds.delete(id);
        const countEl = $('.queue-title .count');
        if (countEl) {
          const selected = [...state.selectedMediaIds].filter((mid) => state.media.some((m) => m.id === mid)).length;
          countEl.textContent = `${state.media.length} 个文件 · 已选 ${selected}`;
        }
        const startBtn = $('[data-action="start-convert"]');
        if (startBtn) {
          const selected = [...state.selectedMediaIds].filter((mid) => state.media.some((m) => m.id === mid)).length;
          startBtn.disabled = selected === 0 || !activeMedia();
          startBtn.innerHTML = `${icon('play')}开始转换${selected ? ` · ${selected}` : ''}`;
        }
        return;
      }
      if (target.matches('[data-media-select]')) {
        setActiveMedia(target.value, true);
        return;
      }
      if (target.matches('[data-bind]')) {
        const bind = target.dataset.bind;
        let value;
        if (target.type === 'checkbox') value = target.checked;
        else if (target.type === 'number' || target.type === 'range') value = Number(target.value);
        else value = target.value;
        const [scope] = bind.split('.');
        if (scope !== 'convert' && scope !== 'edit') return;
        setByPath(state[scope], bind.slice(scope.length + 1), value);
        saveSettings();
        if (target.type === 'range') {
          updateRangeOutput(target);
          syncRangeVisuals(document);
        }
        if (target.dataset.refresh) {
          setTimeout(render, 0);
          return;
        }
        requestPreview(220);
      }
    });

    document.addEventListener('input', (event) => {
      const target = event.target;
      if (target.matches('[data-trim]')) {
        updateTrimUI(target.dataset.trim);
        return;
      }
      if (target.matches('[data-bind]')) {
        if (target.type === 'range') {
          updateRangeOutput(target);
          syncRangeVisuals(document);
        }
        if (target.type === 'range' || target.type === 'number' || target.type === 'text' || target.tagName === 'TEXTAREA') {
          const bind = target.dataset.bind;
          const [scope] = bind.split('.');
          if (scope !== 'convert' && scope !== 'edit') return;
          let value;
          if (target.type === 'number' || target.type === 'range') value = Number(target.value);
          else value = target.value;
          setByPath(state[scope], bind.slice(scope.length + 1), value);
          saveSettings();
          if (target.type === 'range' && state.route === 'edit') {
            const length = Math.max(0, (state.edit.end - state.edit.start) / (Number(state.edit.speed) || 1));
            const lengthEl = $('#edit-output-length');
            if (lengthEl) lengthEl.textContent = fmtDuration(length, true);
          }
          if (target.type !== 'number') requestPreview(220);
        }
      }
    });

    $('#file-input')?.addEventListener('change', (event) => {
      handleIncomingFiles(event.target.files);
      event.target.value = '';
    });

    $('#menu-btn')?.addEventListener('click', openSidebar);
    $('#sidebar-scrim')?.addEventListener('click', closeSidebar);
    $('#system-pill')?.addEventListener('click', () => navigate('system'));

    window.addEventListener('hashchange', () => {
      state.route = routeFromHash();
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!$('#modal-root')?.hidden) closeModal();
        else closeSidebar();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        $('#file-input')?.click();
      }
    });

    window.addEventListener('dragenter', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault();
      dragDepth += 1;
      const overlay = $('#drop-overlay');
      if (overlay) overlay.hidden = false;
    });
    window.addEventListener('dragover', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    });
    window.addEventListener('dragleave', (event) => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0 || event.relatedTarget === null) {
        dragDepth = 0;
        const overlay = $('#drop-overlay');
        if (overlay) overlay.hidden = true;
      }
    });
    window.addEventListener('dragend', () => {
      dragDepth = 0;
      const overlay = $('#drop-overlay');
      if (overlay) overlay.hidden = true;
    });
    window.addEventListener('drop', (event) => {
      if (!event.dataTransfer?.files?.length) return;
      event.preventDefault();
      dragDepth = 0;
      const overlay = $('#drop-overlay');
      if (overlay) overlay.hidden = true;
      handleIncomingFiles(event.dataTransfer.files);
    });
    window.addEventListener('beforeunload', () => {
      clearTimeout(state.pollTimer);
      clearTimeout(previewTimer);
    });

    document.addEventListener('error', (event) => {
      if (event.target?.tagName === 'IMG') event.target.classList.add('is-broken');
    }, true);
  }

  async function boot() {
    hydrateIcons(document);
    bindEvents();
    state.route = routeFromHash();
    $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.route === state.route));
    await loadInitial();
    if (!location.hash) history.replaceState(null, '', '#/dashboard');
    // Expose a tiny debug handle for local diagnostics and automated smoke tests.
    window.__FFSTUDIO__ = {
      state,
      api,
      navigate,
      refreshMedia,
      refreshJobs,
      render,
      uploadFiles,
      handleAction
    };
  }

  boot();
})();
