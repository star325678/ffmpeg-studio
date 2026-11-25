'use strict';

/*
 * FFmpeg Studio - local visual FFmpeg workstation
 * A native, zero-dependency Node.js server that drives FFmpeg 9.x.
 *
 * UI/UX inspiration and product reference:
 * https://github.com/dinoosauro/ffmpeg-web (MIT)
 * FFmpeg: https://ffmpeg.org/
 */

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');

const APP_NAME = 'FFmpeg Studio';
const APP_VERSION = '1.0.1';
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.resolve(process.env.FFSTUDIO_DATA || path.join(ROOT, 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const OUTPUT_DIR = path.join(DATA_DIR, 'outputs');
const THUMB_DIR = path.join(DATA_DIR, 'thumbs');
const JOB_DIR = path.join(DATA_DIR, 'jobs');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const TEMP_DIR = path.join(DATA_DIR, 'temp');
const FFMPEG_DIR = path.resolve(process.env.FFMPEG_DIR || path.join(ROOT, 'ffmpeg', 'bin'));
const FFMPEG = process.env.FFMPEG_PATH ? path.resolve(process.env.FFMPEG_PATH) : path.join(FFMPEG_DIR, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const FFPROBE = process.env.FFPROBE_PATH ? path.resolve(process.env.FFPROBE_PATH) : path.join(FFMPEG_DIR, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
const MAX_UPLOAD_BYTES = Number(process.env.FFSTUDIO_MAX_UPLOAD || 20 * 1024 * 1024 * 1024);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_JOBS = Math.max(1, Math.min(3, Number(process.env.FFSTUDIO_CONCURRENCY || 1)));
const STARTED_AT = Date.now();
const IS_WIN = process.platform === 'win32';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.gif': 'image/gif'
};

const MEDIA_EXTENSIONS = new Set([
  '.mp4', '.mkv', '.webm', '.mov', '.avi', '.m4v', '.flv', '.wmv', '.ts', '.mts', '.m2ts', '.mpeg', '.mpg', '.3gp', '.ogv',
  '.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.oga', '.opus', '.wma', '.aiff', '.aif', '.alac', '.amr',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.avif'
]);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.avif']);

const FORMATS = {
  mp4: { ext: 'mp4', type: 'video', label: 'MP4 / H.264', vcodec: 'h264', acodec: 'aac' },
  mkv: { ext: 'mkv', type: 'video', label: 'MKV / H.264', vcodec: 'h264', acodec: 'aac' },
  webm: { ext: 'webm', type: 'video', label: 'WebM / VP9', vcodec: 'vp9', acodec: 'opus' },
  mov: { ext: 'mov', type: 'video', label: 'MOV / H.264', vcodec: 'h264', acodec: 'aac' },
  gif: { ext: 'gif', type: 'animation', label: 'GIF 动图', vcodec: 'gif' },
  mp3: { ext: 'mp3', type: 'audio', acodec: 'mp3' },
  m4a: { ext: 'm4a', type: 'audio', acodec: 'aac' },
  wav: { ext: 'wav', type: 'audio', acodec: 'pcm_s16le' },
  flac: { ext: 'flac', type: 'audio', acodec: 'flac' },
  opus: { ext: 'opus', type: 'audio', acodec: 'opus' },
  jpg: { ext: 'jpg', type: 'image', vcodec: 'mjpeg' },
  png: { ext: 'png', type: 'image', vcodec: 'png' },
  webp: { ext: 'webp', type: 'image', vcodec: 'libwebp' }
};

const mediaStore = new Map();
const jobStore = new Map();
const activeChildren = new Map();
const thumbJobs = new Map();
const runningJobs = new Set();
let serverPort = Number(process.env.PORT || 4318);
let capabilities = { encoders: {}, hwaccels: [], hardware: { nvidia: false, intel: false, amd: false }, filters: {} };
let ffmpegInfo = { available: false, version: '未检测到', line: '', configuration: '' };
let ffprobeInfo = { available: false, version: '未检测到' };
let shuttingDown = false;

function ensureDirsSync() {
  for (const dir of [DATA_DIR, UPLOAD_DIR, OUTPUT_DIR, THUMB_DIR, JOB_DIR, MEDIA_DIR, TEMP_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(...args) {
  const stamp = new Date().toISOString();
  console.log(`[${stamp}]`, ...args);
}

function safeNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function safeText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.slice(0, 500);
}

function sanitizeFilename(name, fallback = 'output') {
  let base = path.basename(String(name || fallback));
  base = base.replace(/[\u0000-\u001f<>:"/\\|?*\u007f]/g, '_');
  base = base.replace(/\s+/g, ' ').trim();
  base = base.replace(/[. ]+$/g, '');
  if (!base) base = fallback;
  if (base.length > 120) {
    const ext = path.extname(base).slice(0, 10);
    base = base.slice(0, 120 - ext.length) + ext;
  }
  return base;
}

function safeStem(name, fallback = 'media') {
  const base = sanitizeFilename(name, fallback);
  const ext = path.extname(base);
  const stem = base.slice(0, base.length - ext.length).replace(/[. ]+$/g, '') || fallback;
  return stem.slice(0, 90);
}

function quoteArg(arg) {
  const s = String(arg);
  if (s === '') return '""';
  if (!/[\s"&|<>^]/.test(s)) return s;
  let escaped = s.replace(/(\\*)"/g, '$1$1\\"');
  escaped = escaped.replace(/(\\+)$/g, '$1$1');
  return `"${escaped}"`;
}

function commandText(args) {
  return [quoteArg(path.basename(FFMPEG)), ...args.map(quoteArg)].join(' ');
}

function contentTypeFor(file) {
  return MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

async function readJsonBody(req, limit = MAX_BODY_BYTES) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error('请求内容过大');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('请求 JSON 格式无效');
    error.statusCode = 400;
    throw error;
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function sendError(res, statusCode, message, code = '') {
  sendJson(res, statusCode, { error: message, code });
}

function httpError(statusCode, message, code = '') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function saveJson(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
  await fsp.rename(tmp, file);
}

async function exists(file) {
  try {
    await fsp.access(file);
    return true;
  } catch {
    return false;
  }
}

async function execCapture(bin, args, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { child.kill('SIGKILL'); } catch {}
        reject(new Error(`${path.basename(bin)} 执行超时`));
      }
    }, timeout);
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (stdout.length > 30 * 1024 * 1024) stdout = stdout.slice(-20 * 1024 * 1024);
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      if (stderr.length > 30 * 1024 * 1024) stderr = stderr.slice(-20 * 1024 * 1024);
    });
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr, code });
      else {
        const error = new Error(stderr.trim().split(/\r?\n/).slice(-4).join(' ') || `${path.basename(bin)} 退出码 ${code}`);
        error.code = code;
        error.stderr = stderr;
        reject(error);
      }
    });
  });
}

async function probeFile(file) {
  const { stdout } = await execCapture(FFPROBE, [
    '-v', 'error',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    file
  ], 60000);
  return JSON.parse(stdout || '{}');
}

function summarizeProbe(probe, file, originalName) {
  const streams = Array.isArray(probe.streams) ? probe.streams : [];
  const format = probe.format || {};
  const video = streams.find((s) => s.codec_type === 'video' && s.disposition?.attached_pic !== 1);
  const audio = streams.find((s) => s.codec_type === 'audio');
  const subtitle = streams.find((s) => s.codec_type === 'subtitle');
  const imageStream = streams.find((s) => s.codec_type === 'video');
  const ext = path.extname(originalName || file).toLowerCase();
  let kind = 'video';
  if (IMAGE_EXTENSIONS.has(ext)) kind = 'image';
  else if (!video && audio) kind = 'audio';
  else if (video && (format.format_name || '').includes('image2')) kind = 'image';
  else if (video && Number(format.duration || 0) === 0 && Number(video.nb_frames || 0) <= 1 && !audio) kind = 'image';
  const duration = Number(format.duration || video?.duration || audio?.duration || 0);
  let fps = 0;
  if (video?.avg_frame_rate && video.avg_frame_rate !== '0/0') {
    const [a, b] = String(video.avg_frame_rate).split('/').map(Number);
    if (b) fps = a / b;
  }
  return {
    kind,
    duration: Number.isFinite(duration) ? duration : 0,
    width: Number(video?.width || 0),
    height: Number(video?.height || 0),
    videoCodec: video?.codec_name || '',
    videoCodecLong: video?.codec_long_name || '',
    audioCodec: audio?.codec_name || '',
    audioCodecLong: audio?.codec_long_name || '',
    audioChannels: Number(audio?.channels || 0),
    audioChannelLayout: audio?.channel_layout || '',
    sampleRate: Number(audio?.sample_rate || 0),
    bitrate: Number(format.bit_rate || video?.bit_rate || audio?.bit_rate || 0),
    size: Number(format.size || 0),
    fps: Number.isFinite(fps) ? Math.round(fps * 1000) / 1000 : 0,
    frameCount: Number(video?.nb_frames || 0),
    formatName: format.format_long_name || format.format_name || '',
    hasVideo: Boolean(video),
    hasAudio: Boolean(audio),
    hasSubtitle: Boolean(subtitle),
    streamCount: streams.length,
    pixelFormat: video?.pix_fmt || '',
    profile: video?.profile || '',
    rotation: Number(video?.tags?.rotate || 0),
    creationTime: format.tags?.creation_time || '',
    imageStream: Boolean(imageStream)
  };
}

function publicMedia(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.originalName,
    size: item.size,
    createdAt: item.createdAt,
    ext: item.ext,
    kind: item.summary?.kind || 'video',
    summary: item.summary,
    probe: item.probe,
    thumbUrl: `/api/media/${item.id}/thumb`,
    fileUrl: `/api/media/${item.id}/file`
  };
}

function publicJob(job) {
  return {
    id: job.id,
    mediaId: job.mediaId,
    inputName: job.inputName,
    operation: job.operation,
    status: job.status,
    progress: job.progress || 0,
    processedSeconds: job.processedSeconds || 0,
    duration: job.duration || 0,
    fps: job.fps || 0,
    speed: job.speed || 0,
    bitrate: job.bitrate || '',
    eta: job.eta || 0,
    outputName: job.outputName,
    outputSize: job.outputSize || 0,
    outputProbe: job.outputProbe || null,
    error: job.error || '',
    createdAt: job.createdAt,
    startedAt: job.startedAt || null,
    finishedAt: job.finishedAt || null,
    commandText: job.commandText || '',
    logs: (job.logs || []).slice(-80),
    settings: job.settings || {},
    downloadUrl: job.status === 'completed' ? `/api/jobs/${job.id}/download` : null
  };
}

async function initFFmpegInfo() {
  try {
    const version = await execCapture(FFMPEG, ['-hide_banner', '-version'], 20000);
    const lines = version.stdout.trim().split(/\r?\n/);
    ffmpegInfo = {
      available: true,
      version: (lines[0] || '').replace(/^ffmpeg version\s*/i, '').replace(/\s+Copyright.*$/i, '') || 'unknown',
      line: lines[0] || '',
      configuration: (lines.find((l) => l.startsWith('configuration:')) || '').replace(/^configuration:\s*/, '')
    };
  } catch (error) {
    ffmpegInfo = { available: false, version: '未检测到', line: '', configuration: '', error: error.message };
  }
  try {
    const probe = await execCapture(FFPROBE, ['-hide_banner', '-version'], 20000);
    ffprobeInfo = {
      available: true,
      version: (probe.stdout.split(/\r?\n/)[0] || '').replace(/^ffprobe version\s*/i, '').replace(/\s+Copyright.*$/i, '')
    };
  } catch (error) {
    ffprobeInfo = { available: false, version: '未检测到', error: error.message };
  }
}

async function detectCapabilities() {
  const result = { encoders: {}, hwaccels: [], hardware: { nvidia: false, intel: false, amd: false }, filters: {} };
  if (!ffmpegInfo.available) {
    capabilities = result;
    return;
  }
  try {
    const enc = await execCapture(FFMPEG, ['-hide_banner', '-encoders'], 30000);
    for (const line of enc.stdout.split(/\r?\n/)) {
      const match = line.match(/^\s*([VAS])([A-Z.]{5})\s+(\S+)/);
      if (match && match[3] !== '=') result.encoders[match[3]] = true;
    }
  } catch {}
  try {
    const hw = await execCapture(FFMPEG, ['-hide_banner', '-hwaccels'], 20000);
    result.hwaccels = hw.stdout.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('Hardware acceleration'));
  } catch {}
  try {
    const filters = await execCapture(FFMPEG, ['-hide_banner', '-filters'], 30000);
    for (const line of filters.stdout.split(/\r?\n/)) {
      const match = line.match(/^\s*[A-Z.]{2,4}\s+([A-Za-z0-9_]+)\s/);
      if (match) result.filters[match[1]] = true;
    }
  } catch {}
  result.hardware.nvidia = Boolean(result.encoders.h264_nvenc || result.encoders.hevc_nvenc);
  result.hardware.intel = Boolean(result.encoders.h264_qsv || result.encoders.hevc_qsv);
  result.hardware.amd = Boolean(result.encoders.h264_amf || result.encoders.hevc_amf);
  capabilities = result;
}

async function listDisk() {
  try {
    if (typeof fsp.statfs === 'function') {
      const stat = await fsp.statfs(DATA_DIR);
      return { free: Number(stat.bavail) * Number(stat.bsize), total: Number(stat.blocks) * Number(stat.bsize) };
    }
  } catch {}
  return { free: 0, total: 0 };
}

async function loadState() {
  await fsp.mkdir(MEDIA_DIR, { recursive: true });
  await fsp.mkdir(JOB_DIR, { recursive: true });
  const mediaFiles = await fsp.readdir(MEDIA_DIR).catch(() => []);
  for (const name of mediaFiles) {
    if (!name.endsWith('.json')) continue;
    try {
      const item = JSON.parse(await fsp.readFile(path.join(MEDIA_DIR, name), 'utf8'));
      if (item?.id && item?.path && await exists(item.path)) mediaStore.set(item.id, item);
    } catch {}
  }
  const jobFiles = await fsp.readdir(JOB_DIR).catch(() => []);
  for (const name of jobFiles) {
    if (!name.endsWith('.json')) continue;
    try {
      const job = JSON.parse(await fsp.readFile(path.join(JOB_DIR, name), 'utf8'));
      if (!job?.id) continue;
      if (job.status === 'running' || job.status === 'queued') {
        job.status = 'failed';
        job.error = '应用重启，任务已中断';
        job.finishedAt = new Date().toISOString();
        await persistJob(job);
      }
      jobStore.set(job.id, job);
    } catch {}
  }
}

async function persistMedia(item) {
  await saveJson(path.join(MEDIA_DIR, `${item.id}.json`), item);
}

async function persistJob(job) {
  await saveJson(path.join(JOB_DIR, `${job.id}.json`), job);
}

function uniqueOutputPath(dir, preferredName) {
  const ext = path.extname(preferredName);
  const stem = preferredName.slice(0, preferredName.length - ext.length) || 'output';
  let candidate = path.join(dir, `${stem}${ext}`);
  let index = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${stem} (${index})${ext}`);
    index += 1;
  }
  return candidate;
}

function convertOutputName(media, settings) {
  const fmt = FORMATS[settings.format] || FORMATS.mp4;
  const requested = safeText(settings.outputName).trim();
  const stem = requested ? safeStem(requested, 'output') : `${safeStem(media.originalName, 'media')}_${settings.format || fmt.ext}`;
  return `${stem}.${fmt.ext}`;
}

function editOutputName(media, settings) {
  const fmt = FORMATS[settings.format] || FORMATS.mp4;
  const requested = safeText(settings.outputName).trim();
  const stem = requested ? safeStem(requested, 'output') : `${safeStem(media.originalName, 'media')}_edit`;
  return `${stem}.${fmt.ext}`;
}

function pixFmtArgs(vcodec) {
  if (['h264', 'hevc', 'av1', 'vp9'].includes(vcodec)) return ['-pix_fmt', 'yuv420p'];
  return [];
}

function videoFilterFor(settings) {
  const filters = [];
  const resolution = safeText(settings.resolution, 'source');
  if (resolution && resolution !== 'source') {
    let w = 0;
    let h = 0;
    if (resolution === 'custom') {
      w = Math.round(safeNumber(settings.customWidth, 0, 2, 7680) / 2) * 2;
      h = Math.round(safeNumber(settings.customHeight, 0, 2, 4320) / 2) * 2;
    } else if (/^\d+p$/.test(resolution)) {
      const target = Number(resolution.slice(0, -1));
      const sizes = { 2160: [3840, 2160], 1440: [2560, 1440], 1080: [1920, 1080], 720: [1280, 720], 480: [854, 480], 360: [640, 360] };
      if (sizes[target]) [w, h] = sizes[target];
    } else if (/^\d+x\d+$/.test(resolution)) {
      [w, h] = resolution.split('x').map(Number);
    }
    if (w > 1 && h > 1) {
      const mode = settings.scaleMode === 'fill' ? 'fill' : 'fit';
      if (mode === 'fill') filters.push(`scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`);
      else filters.push(`scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black`);
    }
  }
  const fps = settings.fps;
  if (fps && fps !== 'source') {
    const n = safeNumber(fps, 0, 1, 240);
    if (n > 0) filters.push(`fps=${n}`);
  }
  return filters;
}

function videoEncoderArgs(settings, defaultCodec) {
  const codec = settings.videoCodec && settings.videoCodec !== 'auto' ? settings.videoCodec : defaultCodec;
  const crf = Math.round(safeNumber(settings.crf, 23, 0, 51));
  const preset = ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow'].includes(settings.preset) ? settings.preset : 'medium';
  const rateMode = settings.rateMode === 'bitrate' ? 'bitrate' : 'crf';
  const bitrate = Math.round(safeNumber(settings.videoBitrate, 6000, 100, 200000));
  const hardware = ['auto', 'none', 'nvidia', 'intel', 'amd'].includes(settings.hardware) ? settings.hardware : 'none';
  const args = [];
  if (codec === 'copy') return ['-c:v', 'copy'];
  if (codec === 'gif') return [];
  let encoder = codec;
  let isHardware = false;
  if (codec === 'h264' || codec === 'hevc') {
    let hw = hardware;
    if (hw === 'auto') {
      if (capabilities.encoders[`${codec}_nvenc`]) hw = 'nvidia';
      else if (capabilities.encoders[`${codec}_qsv`]) hw = 'intel';
      else if (capabilities.encoders[`${codec}_amf`]) hw = 'amd';
      else hw = 'none';
    }
    if (hw === 'nvidia' && capabilities.encoders[`${codec}_nvenc`]) { encoder = `${codec}_nvenc`; isHardware = true; }
    else if (hw === 'intel' && capabilities.encoders[`${codec}_qsv`]) { encoder = `${codec}_qsv`; isHardware = true; }
    else if (hw === 'amd' && capabilities.encoders[`${codec}_amf`]) { encoder = `${codec}_amf`; isHardware = true; }
    else encoder = codec === 'h264' ? 'libx264' : 'libx265';
  } else if (codec === 'vp9') encoder = 'libvpx-vp9';
  else if (codec === 'av1') encoder = capabilities.encoders.libsvtav1 ? 'libsvtav1' : 'libaom-av1';
  args.push('-c:v', encoder);
  if (isHardware) {
    if (encoder.endsWith('_nvenc')) {
      args.push('-preset', 'p5', '-tune', 'hq');
      if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
      else args.push('-rc', 'vbr', '-cq', String(crf), '-b:v', '0');
    } else if (encoder.endsWith('_qsv')) {
      args.push('-preset', preset);
      if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
      else args.push('-global_quality', String(crf));
    } else if (encoder.endsWith('_amf')) {
      args.push('-quality', 'balanced', '-rc', 'cqp', '-qp_i', String(crf), '-qp_p', String(crf));
      if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
    }
  } else if (encoder === 'libx264' || encoder === 'libx265') {
    args.push('-preset', preset);
    if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
    else args.push('-crf', String(crf));
  } else if (encoder === 'libvpx-vp9') {
    args.push('-row-mt', '1');
    if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
    else args.push('-crf', String(crf), '-b:v', '0');
  } else if (encoder === 'libsvtav1') {
    args.push('-preset', '6');
    if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
    else args.push('-crf', String(crf));
  } else if (encoder === 'libaom-av1') {
    args.push('-cpu-used', '5');
    if (rateMode === 'bitrate') args.push('-b:v', `${bitrate}k`);
    else args.push('-crf', String(crf), '-b:v', '0');
  }
  args.push(...pixFmtArgs(codec));
  if (codec === 'hevc' && settings.format === 'mp4') args.push('-tag:v', 'hvc1');
  return args;
}

function audioEncoderArgs(settings, defaultCodec) {
  const requested = settings.audioCodec && settings.audioCodec !== 'auto'
    ? settings.audioCodec
    : (defaultCodec || 'aac');
  if (requested === 'none') return ['-an'];
  if (requested === 'copy') return ['-c:a', 'copy'];
  const bitrate = Math.round(safeNumber(settings.audioBitrate, 192, 32, 512));
  let codec = requested;
  if (requested === 'aac') codec = 'aac';
  if (requested === 'mp3') codec = 'libmp3lame';
  if (requested === 'opus') codec = 'libopus';
  if (requested === 'vorbis') codec = 'libvorbis';
  if (requested === 'flac') codec = 'flac';
  if (requested === 'pcm') codec = 'pcm_s16le';
  const args = ['-c:a', codec];
  if (!['flac', 'pcm_s16le'].includes(codec)) args.push('-b:a', `${bitrate}k`);
  const sampleRate = Number(settings.sampleRate || 0);
  if ([22050, 32000, 44100, 48000, 96000].includes(sampleRate)) args.push('-ar', String(sampleRate));
  const channels = Number(settings.channels || 0);
  if ([1, 2].includes(channels)) args.push('-ac', String(channels));
  return args;
}

function buildConvertArgs(media, rawSettings, outputPath) {
  const fmt = FORMATS[rawSettings.format] || FORMATS.mp4;
  const settings = { ...rawSettings };
  if (fmt.ext === 'webm') {
    if (['h264', 'hevc'].includes(settings.videoCodec)) settings.videoCodec = 'vp9';
    if (settings.videoCodec === 'copy' && !['vp8', 'vp9', 'av1'].includes(media.summary?.videoCodec)) settings.videoCodec = 'vp9';
    if (!['opus', 'vorbis', 'none', 'copy'].includes(settings.audioCodec)) settings.audioCodec = 'opus';
  }
  if (settings.videoCodec === 'copy' && videoFilterFor(settings).length > 0) settings.videoCodec = 'auto';
  if (fmt.type === 'audio' && (!settings.audioCodec || settings.audioCodec === 'none')) settings.audioCodec = fmt.acodec;
  const args = ['-hide_banner', '-y', '-i', media.path];
  if (fmt.type === 'audio') args.push('-vn', ...audioEncoderArgs(settings, fmt.acodec));
  else if (fmt.type === 'image') {
    const filters = videoFilterFor({ ...settings, fps: 'source' });
    if (filters.length) args.push('-vf', filters.join(','));
    args.push('-frames:v', '1');
    const codec = fmt.vcodec;
    if (codec === 'libwebp') args.push('-c:v', 'libwebp', '-quality', String(Math.round(100 - safeNumber(settings.crf, 80, 0, 51))));
    else if (codec === 'mjpeg') args.push('-c:v', 'mjpeg', '-q:v', String(Math.max(2, Math.min(31, Math.round(safeNumber(settings.crf, 4, 2, 31))))));
    else args.push('-c:v', 'png');
  } else if (fmt.type === 'animation') {
    args.push('-an');
    const filters = [];
    const fps = safeNumber(settings.gifFps, 12, 1, 30);
    filters.push(`fps=${fps}`);
    const width = Math.round(safeNumber(settings.gifWidth, 640, 64, 1920) / 2) * 2;
    filters.push(`scale=${width}:-1:flags=lanczos`);
    filters.push('split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer');
    args.push('-vf', filters.join(','), '-loop', '0');
  } else {
    const filters = videoFilterFor(settings);
    if (filters.length) args.push('-vf', filters.join(','));
    args.push(...videoEncoderArgs(settings, fmt.vcodec || 'h264'));
    if (media.summary?.hasAudio === false || settings.audioCodec === 'none') args.push('-an');
    else args.push(...audioEncoderArgs(settings, fmt.acodec));
    if (['mp4', 'mov'].includes(fmt.ext)) args.push('-movflags', '+faststart');
  }
  if (settings.stripMetadata) args.push('-map_metadata', '-1');
  if (settings.faststart === false && ['mp4', 'mov'].includes(fmt.ext)) {
    const i = args.indexOf('+faststart');
    if (i !== -1) args.splice(i - 1, 2);
  }
  const threads = Number(settings.threads || 0);
  if (threads > 0) args.push('-threads', String(Math.round(Math.min(64, threads))));
  args.push(outputPath);
  return args;
}

function escapeFilterText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/%/g, '\\%')
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\r?\n/g, '\\n');
}

function atempoChain(speed) {
  const parts = [];
  let value = speed;
  while (value > 2) { parts.push('atempo=2'); value /= 2; }
  while (value < 0.5) { parts.push('atempo=0.5'); value /= 0.5; }
  if (Math.abs(value - 1) > 0.001) parts.push(`atempo=${value.toFixed(4)}`);
  return parts;
}

function buildEditArgs(media, rawSettings, outputPath) {
  const fmt = FORMATS[rawSettings.format] || FORMATS.mp4;
  const settings = { ...rawSettings };
  if (fmt.ext === 'webm') {
    if (['h264', 'hevc'].includes(settings.videoCodec)) settings.videoCodec = 'vp9';
    if (!['opus', 'vorbis', 'none', 'copy'].includes(settings.audioCodec)) settings.audioCodec = 'opus';
  }
  const start = safeNumber(settings.start, 0, 0, 86400 * 24);
  const endRaw = safeNumber(settings.end, 0, 0, 86400 * 24);
  const duration = Number(media.summary?.duration || 0);
  const end = endRaw > start ? Math.min(endRaw, duration > 0 ? duration : endRaw) : duration;
  const clipDuration = Math.max(0.01, end > start ? end - start : duration - start);
  const speed = safeNumber(settings.speed, 1, 0.25, 4);
  const isStill = media.summary?.kind === 'image' || fmt.type === 'image';
  const outDuration = Math.max(0.01, clipDuration / speed);
  const args = ['-hide_banner', '-y'];
  if (start > 0) args.push('-ss', start.toFixed(3));
  args.push('-i', media.path);
  if (!isStill) args.push('-t', outDuration.toFixed(3));

  const filters = [];
  const audioFilters = [];
  if (settings.crop?.enabled) {
    const cw = Math.round(safeNumber(settings.crop.width, 0, 2, 7680) / 2) * 2;
    const ch = Math.round(safeNumber(settings.crop.height, 0, 2, 4320) / 2) * 2;
    const cx = Math.round(safeNumber(settings.crop.x, 0, 0, 7680));
    const cy = Math.round(safeNumber(settings.crop.y, 0, 0, 4320));
    if (cw > 1 && ch > 1) filters.push(`crop=${cw}:${ch}:${cx}:${cy}`);
  }
  if (settings.scale?.enabled) {
    const sw = Math.round(safeNumber(settings.scale.width, 1280, 2, 7680) / 2) * 2;
    const sh = Math.round(safeNumber(settings.scale.height, 720, 2, 4320) / 2) * 2;
    filters.push(`scale=${sw}:${sh}:force_original_aspect_ratio=decrease,pad=${sw}:${sh}:(ow-iw)/2:(oh-ih)/2:color=black`);
  }
  if (settings.rotate === '90') filters.push('transpose=1');
  else if (settings.rotate === '180') filters.push('transpose=1,transpose=1');
  else if (settings.rotate === '270') filters.push('transpose=2');
  if (settings.flipHorizontal) filters.push('hflip');
  if (settings.flipVertical) filters.push('vflip');
  const brightness = safeNumber(settings.brightness, 0, -1, 1);
  const contrast = safeNumber(settings.contrast, 1, 0, 2);
  const saturation = safeNumber(settings.saturation, 1, 0, 3);
  if (Math.abs(brightness) > 0.001 || Math.abs(contrast - 1) > 0.001 || Math.abs(saturation - 1) > 0.001) {
    filters.push(`eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`);
  }
  if (settings.denoise) filters.push('hqdn3d=3:2:5:4');
  if (settings.sharpen) filters.push('unsharp=5:5:0.8');
  if (!isStill && Math.abs(speed - 1) > 0.001) filters.push(`setpts=PTS/${speed}`);
  const fadeIn = safeNumber(settings.fadeIn, 0, 0, 30);
  const fadeOut = safeNumber(settings.fadeOut, 0, 0, 30);
  if (!isStill && fadeIn > 0) filters.push(`fade=t=in:st=0:d=${Math.min(fadeIn, outDuration)}`);
  if (!isStill && fadeOut > 0) filters.push(`fade=t=out:st=${Math.max(0, outDuration - fadeOut)}:d=${Math.min(fadeOut, outDuration)}`);
  if (settings.watermark?.enabled && safeText(settings.watermark.text).trim()) {
    const text = escapeFilterText(safeText(settings.watermark.text).trim());
    const size = Math.round(safeNumber(settings.watermark.size, 30, 8, 160));
    const opacity = safeNumber(settings.watermark.opacity, 0.8, 0.05, 1);
    const pos = settings.watermark.position || 'bottom-right';
    const positions = {
      'top-left': 'x=24:y=24',
      'top-right': 'x=w-tw-24:y=24',
      'bottom-left': 'x=24:y=h-th-24',
      'bottom-right': 'x=w-tw-24:y=h-th-24',
      center: 'x=(w-tw)/2:y=(h-th)/2'
    };
    const font = IS_WIN && fs.existsSync('C:\\Windows\\Fonts\\msyh.ttc') ? "fontfile='C\\:/Windows/Fonts/msyh.ttc':" : '';
    filters.push(`drawtext=${font}text='${text}':fontcolor=white@${opacity.toFixed(2)}:fontsize=${size}:${positions[pos] || positions['bottom-right']}:box=1:boxcolor=black@0.42:boxborderw=10`);
  }
  if (!isStill && Math.abs(speed - 1) > 0.001) audioFilters.push(...atempoChain(speed));
  const volume = safeNumber(settings.volume, 1, 0, 3);
  if (!isStill && Math.abs(volume - 1) > 0.001) audioFilters.push(`volume=${volume.toFixed(2)}`);
  if (!isStill && fadeIn > 0) audioFilters.push(`afade=t=in:st=0:d=${Math.min(fadeIn, outDuration)}`);
  if (!isStill && fadeOut > 0) audioFilters.push(`afade=t=out:st=${Math.max(0, outDuration - fadeOut)}:d=${Math.min(fadeOut, outDuration)}`);
  if (fmt.type === 'audio' && (!settings.audioCodec || settings.audioCodec === 'none')) settings.audioCodec = fmt.acodec;

  if (audioFilters.length && fmt.type !== 'animation' && fmt.type !== 'image') {
    args.push('-af', audioFilters.join(','));
  }
  if (fmt.type === 'audio') {
    args.push('-vn', ...audioEncoderArgs(settings, fmt.acodec));
  } else if (fmt.type === 'animation') {
    args.push('-an');
    const gifFps = safeNumber(settings.gifFps, 12, 1, 30);
    const gifWidth = Math.round(safeNumber(settings.gifWidth, 640, 64, 1920) / 2) * 2;
    const chain = (filters.length ? filters.join(',') + ',' : '') + `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer`;
    args.push('-vf', chain, '-loop', '0');
  } else if (fmt.type === 'image') {
    if (filters.length) args.push('-vf', filters.join(','));
    args.push('-frames:v', '1');
    args.push('-c:v', fmt.vcodec === 'mjpeg' ? 'mjpeg' : fmt.vcodec === 'libwebp' ? 'libwebp' : 'png');
  } else {
    if (filters.length) args.push('-vf', filters.join(','));
    args.push(...videoEncoderArgs(settings, fmt.vcodec || 'h264'));
    if (media.summary?.hasAudio === false || settings.audioCodec === 'none') args.push('-an');
    else args.push(...audioEncoderArgs(settings, fmt.acodec));
    if (['mp4', 'mov'].includes(fmt.ext)) args.push('-movflags', '+faststart');
  }
  const threads = Number(settings.threads || 0);
  if (threads > 0) args.push('-threads', String(Math.round(Math.min(64, threads))));
  args.push(outputPath);
  return args;
}

function createJobSpec(media, operation, settings) {
  const safeSettings = settings && typeof settings === 'object' ? settings : {};
  if (operation === 'convert') {
    const outputName = convertOutputName(media, safeSettings);
    const outputPath = uniqueOutputPath(OUTPUT_DIR, outputName);
    const args = buildConvertArgs(media, safeSettings, outputPath);
    return { args, outputPath, outputName: path.basename(outputPath) };
  }
  if (operation === 'edit') {
    const outputName = editOutputName(media, safeSettings);
    const outputPath = uniqueOutputPath(OUTPUT_DIR, outputName);
    const args = buildEditArgs(media, safeSettings, outputPath);
    return { args, outputPath, outputName: path.basename(outputPath) };
  }
  throw httpError(400, '未知的操作类型');
}

function createPreviewSpec(media, operation, settings) {
  const spec = createJobSpec(media, operation, settings);
  const previewPath = path.join(OUTPUT_DIR, spec.outputName);
  const args = operation === 'convert'
    ? buildConvertArgs(media, settings, previewPath)
    : buildEditArgs(media, settings, previewPath);
  return { args, outputName: spec.outputName, commandText: commandText(args) };
}

function parseProgressLine(job, line) {
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (key === 'out_time_us' || key === 'out_time_ms') {
    const us = Number(value);
    if (Number.isFinite(us)) job.processedSeconds = Math.max(0, us / 1_000_000);
  } else if (key === 'out_time') {
    const match = value.match(/(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (match) job.processedSeconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  } else if (key === 'fps') {
    const n = Number(value);
    if (Number.isFinite(n)) job.fps = n;
  } else if (key === 'speed') {
    const n = Number(String(value).replace(/x$/, ''));
    if (Number.isFinite(n)) job.speed = n;
  } else if (key === 'bitrate') {
    job.bitrate = value;
  } else if (key === 'progress') {
    job.progress = value === 'end' ? 100 : Math.min(99.5, job.duration > 0 ? (job.processedSeconds / job.duration) * 100 : 0);
    if (value === 'end') job.progress = 100;
    const elapsed = (Date.now() - job.startedAt) / 1000;
    const remaining = Math.max(0, job.duration - job.processedSeconds);
    if (job.speed > 0.01) job.eta = remaining / job.speed;
    else if (job.processedSeconds > 0.2 && elapsed > 0) job.eta = remaining / (job.processedSeconds / elapsed);
    else job.eta = 0;
  }
}

function appendJobLog(job, text) {
  const lines = String(text).split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    job.logs.push(line.slice(0, 1000));
  }
  if (job.logs.length > 140) job.logs.splice(0, job.logs.length - 140);
}

async function startJob(job) {
  if (shuttingDown) return;
  if (!ffmpegInfo.available) {
    job.status = 'failed';
    job.error = '未找到可用的 FFmpeg';
    job.finishedAt = new Date().toISOString();
    await persistJob(job);
    return;
  }
  job.status = 'running';
  job.startedAt = Date.now();
  job.progress = 0;
  job.error = '';
  runningJobs.add(job.id);
  await persistJob(job);
  const media = mediaStore.get(job.mediaId);
  if (!media) {
    job.status = 'failed';
    job.error = '源媒体文件不存在';
    job.finishedAt = new Date().toISOString();
    runningJobs.delete(job.id);
    await persistJob(job);
    return;
  }
  let spec;
  try {
    spec = createJobSpec(media, job.operation, job.settings);
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    job.finishedAt = new Date().toISOString();
    runningJobs.delete(job.id);
    await persistJob(job);
    return;
  }
  job.outputPath = spec.outputPath;
  job.outputName = spec.outputName;
  const runArgs = spec.args.length
    ? [spec.args[0], '-progress', 'pipe:1', '-nostats', ...spec.args.slice(1)]
    : spec.args;
  job.commandText = commandText(runArgs);
  job.args = runArgs;
  const child = spawn(FFMPEG, runArgs, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  activeChildren.set(job.id, child);
  let stdoutBuffer = '';
  let progressBuffer = '';
  let lastPersist = 0;
  let finished = false;
  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || '';
    for (const line of lines) {
      parseProgressLine(job, line);
      if (line.startsWith('progress=')) {
        const now = Date.now();
        if (now - lastPersist > 1000) {
          lastPersist = now;
          persistJob(job).catch(() => {});
        }
      }
    }
  });
  child.stderr.on('data', (chunk) => {
    progressBuffer += chunk.toString();
    const lines = progressBuffer.split(/\r?\n/);
    progressBuffer = lines.pop() || '';
    if (lines.length) appendJobLog(job, lines.join('\n'));
  });
  child.on('error', async (error) => {
    if (finished) return;
    finished = true;
    activeChildren.delete(job.id);
    runningJobs.delete(job.id);
    job.status = 'failed';
    job.error = error.message;
    job.finishedAt = new Date().toISOString();
    await persistJob(job).catch(() => {});
    pumpQueue();
  });
  child.on('close', async (code) => {
    if (finished) return;
    finished = true;
    activeChildren.delete(job.id);
    runningJobs.delete(job.id);
    if (stdoutBuffer.trim()) parseProgressLine(job, stdoutBuffer.trim().split(/\r?\n/)[0]);
    if (progressBuffer.trim()) appendJobLog(job, progressBuffer.trim());
    job.finishedAt = new Date().toISOString();
    if (job.cancelRequested) {
      job.status = 'canceled';
      job.error = '任务已取消';
      await fsp.rm(job.outputPath, { force: true }).catch(() => {});
    } else if (code === 0) {
      try {
        const stat = await fsp.stat(job.outputPath);
        job.outputSize = stat.size;
        job.progress = 100;
        const outputProbe = await probeFile(job.outputPath);
        job.outputProbe = summarizeProbe(outputProbe, job.outputPath, job.outputName);
        job.status = 'completed';
        job.error = '';
      } catch (error) {
        job.status = 'failed';
        job.error = `输出文件校验失败：${error.message}`;
      }
    } else {
      job.status = 'failed';
      job.error = (job.logs || []).slice(-8).join(' ').slice(-900) || `FFmpeg 退出码 ${code}`;
      await fsp.rm(job.outputPath, { force: true }).catch(() => {});
    }
    await persistJob(job).catch((error) => log('保存任务失败', error.message));
    log(`任务 ${job.id.slice(0, 8)} ${job.status}: ${job.outputName}`);
    pumpQueue();
  });
}

function pumpQueue() {
  if (shuttingDown) return;
  if (runningJobs.size >= MAX_JOBS) return;
  const queued = [...jobStore.values()]
    .filter((job) => job.status === 'queued')
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  for (const job of queued) {
    if (runningJobs.size >= MAX_JOBS) break;
    runningJobs.add(job.id);
    startJob(job).catch((error) => {
      runningJobs.delete(job.id);
      job.status = 'failed';
      job.error = error.message;
      persistJob(job).catch(() => {});
      pumpQueue();
    });
  }
}

async function createJobs(body) {
  const mediaIds = Array.isArray(body.mediaIds) ? body.mediaIds : body.mediaId ? [body.mediaId] : [];
  if (!mediaIds.length) throw httpError(400, '请先选择媒体文件');
  const operation = body.operation === 'edit' ? 'edit' : 'convert';
  const settings = body.settings && typeof body.settings === 'object' ? body.settings : {};
  if (!['mp4', 'mkv', 'webm', 'mov', 'gif', 'mp3', 'm4a', 'wav', 'flac', 'opus', 'jpg', 'png', 'webp'].includes(settings.format)) {
    throw httpError(400, '输出格式无效');
  }
  const targetFormat = FORMATS[settings.format];
  const created = [];
  for (const mediaId of mediaIds.slice(0, 50)) {
    const media = mediaStore.get(mediaId);
    if (!media) continue;
    if (targetFormat.type === 'audio' && !media.summary?.hasAudio) continue;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const displayOutputName = operation === 'edit' ? editOutputName(media, settings) : convertOutputName(media, settings);
    const job = {
      id,
      mediaId,
      inputName: media.originalName,
      operation,
      status: 'queued',
      progress: 0,
      processedSeconds: 0,
      duration: Number(media.summary?.duration || 0),
      fps: 0,
      speed: 0,
      bitrate: '',
      eta: 0,
      outputName: displayOutputName,
      outputPath: '',
      outputSize: 0,
      error: '',
      createdAt,
      startedAt: null,
      finishedAt: null,
      commandText: '',
      logs: [],
      settings: JSON.parse(JSON.stringify(settings))
    };
    jobStore.set(id, job);
    await persistJob(job);
    created.push(publicJob(job));
  }
  if (!created.length) throw httpError(404, '未找到可用的媒体文件');
  setTimeout(pumpQueue, 30);
  return created;
}

async function cancelJob(job) {
  if (!['queued', 'running'].includes(job.status)) throw httpError(409, '任务已经结束');
  job.cancelRequested = true;
  if (job.status === 'queued') {
    job.status = 'canceled';
    job.error = '任务已取消';
    job.finishedAt = new Date().toISOString();
    job.progress = 0;
    await persistJob(job);
    return publicJob(job);
  }
  const child = activeChildren.get(job.id);
  if (child) {
    try { child.kill('SIGTERM'); } catch {}
    setTimeout(() => {
      if (activeChildren.has(job.id)) {
        try { child.kill('SIGKILL'); } catch {}
      }
    }, 2500);
  }
  return publicJob(job);
}

async function createThumb(media) {
  const existingJpg = path.join(THUMB_DIR, `${media.id}.jpg`);
  const existingPng = path.join(THUMB_DIR, `${media.id}.png`);
  if (await exists(existingJpg)) return existingJpg;
  if (await exists(existingPng)) return existingPng;
  if (thumbJobs.has(media.id)) return thumbJobs.get(media.id);
  const task = (async () => {
    if (media.summary?.kind === 'audio') {
      const out = existingPng;
      await execCapture(FFMPEG, [
        '-hide_banner', '-y', '-i', media.path,
        '-filter_complex', 'showwavespic=s=900x240:colors=0x6ee7a8|0xffb86b',
        '-frames:v', '1', out
      ], 120000);
      return out;
    }
    const out = existingJpg;
    const duration = Number(media.summary?.duration || 0);
    const at = duration > 2 ? Math.min(duration * 0.2, 8) : 0;
    const args = ['-hide_banner', '-y'];
    if (at > 0) args.push('-ss', at.toFixed(2));
    args.push('-i', media.path, '-frames:v', '1', '-vf', 'scale=720:-2:force_original_aspect_ratio=decrease', '-q:v', '3', out);
    await execCapture(FFMPEG, args, 120000);
    return out;
  })();
  thumbJobs.set(media.id, task);
  try {
    return await task;
  } finally {
    thumbJobs.delete(media.id);
  }
}

function parseRange(rangeHeader, size) {
  if (!rangeHeader) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) return null;
  let start = match[1] === '' ? null : Number(match[1]);
  let end = match[2] === '' ? null : Number(match[2]);
  if (start === null && end === null) return null;
  if (start === null) {
    start = Math.max(0, size - end);
    end = size - 1;
  } else {
    end = end === null ? size - 1 : Math.min(end, size - 1);
  }
  if (start > end || start >= size) return { invalid: true };
  return { start, end };
}

async function streamFile(req, res, file, { download = false, filename = '' } = {}) {
  let stat;
  try { stat = await fsp.stat(file); } catch { return sendError(res, 404, '文件不存在'); }
  if (!stat.isFile()) return sendError(res, 404, '文件不存在');
  const range = parseRange(req.headers.range, stat.size);
  const headers = {
    'Content-Type': contentTypeFor(file),
    'Accept-Ranges': 'bytes',
    'Cache-Control': download ? 'no-store' : 'private, max-age=3600',
    'X-Content-Type-Options': 'nosniff'
  };
  if (download || filename) {
    const name = filename || path.basename(file);
    headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`;
  }
  if (range?.invalid) {
    res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
    return res.end();
  }
  if (range) {
    headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stat.size}`;
    headers['Content-Length'] = range.end - range.start + 1;
    res.writeHead(206, headers);
    fs.createReadStream(file, { start: range.start, end: range.end }).pipe(res);
  } else {
    headers['Content-Length'] = stat.size;
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  }
}

async function handleUpload(req, res) {
  let originalName = 'upload.bin';
  try {
    originalName = decodeURIComponent(String(req.headers['x-file-name'] || 'upload.bin'));
  } catch {}
  originalName = sanitizeFilename(originalName, 'upload.bin');
  const ext = path.extname(originalName).toLowerCase();
  if (!MEDIA_EXTENSIONS.has(ext)) {
    return sendError(res, 415, `不支持的文件类型：${ext || '无扩展名'}`, 'UNSUPPORTED_TYPE');
  }
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_UPLOAD_BYTES) return sendError(res, 413, '文件超过 20 GB 限制');
  const id = crypto.randomUUID();
  const storedPath = path.join(UPLOAD_DIR, `${id}${ext}`);
  let received = 0;
  let aborted = false;
  req.on('data', (chunk) => {
    received += chunk.length;
    if (received > MAX_UPLOAD_BYTES && !aborted) {
      aborted = true;
      req.destroy();
    }
  });
  try {
    await pipeline(req, fs.createWriteStream(storedPath));
  } catch (error) {
    await fsp.rm(storedPath, { force: true }).catch(() => {});
    if (aborted) return sendError(res, 413, '文件超过 20 GB 限制');
    if (!res.headersSent) return sendError(res, 400, `上传失败：${error.message}`);
    return;
  }
  try {
    const probe = await probeFile(storedPath);
    const summary = summarizeProbe(probe, storedPath, originalName);
    if (!summary.streamCount) throw new Error('文件中没有可识别的音视频流');
    const stat = await fsp.stat(storedPath);
    const item = {
      id,
      originalName,
      ext,
      path: storedPath,
      size: stat.size,
      createdAt: new Date().toISOString(),
      probe,
      summary
    };
    mediaStore.set(id, item);
    await persistMedia(item);
    log(`已上传 ${originalName} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
    return sendJson(res, 201, { media: publicMedia(item) });
  } catch (error) {
    await fsp.rm(storedPath, { force: true }).catch(() => {});
    return sendError(res, 422, `无法解析该媒体文件：${error.message}`, 'PROBE_FAILED');
  }
}

async function handleApi(req, res, url) {
  const { pathname, searchParams } = url;
  const method = req.method || 'GET';

  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      app: APP_NAME,
      version: APP_VERSION,
      ffmpeg: ffmpegInfo.available,
      ffmpegVersion: ffmpegInfo.version,
      port: serverPort,
      uptime: Math.round((Date.now() - STARTED_AT) / 1000)
    });
  }

  if (method === 'GET' && pathname === '/api/system') {
    const disk = await listDisk();
    return sendJson(res, 200, {
      app: {
        name: APP_NAME,
        version: APP_VERSION,
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        startedAt: new Date(STARTED_AT).toISOString(),
        uptime: Math.round((Date.now() - STARTED_AT) / 1000),
        concurrency: MAX_JOBS,
        dataDir: DATA_DIR
      },
      ffmpeg: {
        ...ffmpegInfo,
        binary: FFMPEG,
        probeBinary: FFPROBE,
        build: 'gyan.dev 9.1 essentials (GPLv3)',
        releaseDate: '2026-11-20',
        officialSite: 'https://ffmpeg.org/'
      },
      ffprobe: ffprobeInfo,
      capabilities,
      disk,
      counts: {
        media: mediaStore.size,
        jobs: jobStore.size,
        running: runningJobs.size,
        queued: [...jobStore.values()].filter((job) => job.status === 'queued').length
      }
    });
  }

  if (method === 'POST' && pathname === '/api/selftest') {
    if (!ffmpegInfo.available) return sendError(res, 503, 'FFmpeg 不可用');
    const file = path.join(TEMP_DIR, `selftest-${Date.now()}.mp4`);
    const started = Date.now();
    try {
      await execCapture(FFMPEG, [
        '-hide_banner', '-y',
        '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30',
        '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000',
        '-t', '2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '96k', file
      ], 120000);
      const stat = await fsp.stat(file);
      const probe = await probeFile(file);
      const summary = summarizeProbe(probe, file, 'selftest.mp4');
      await fsp.rm(file, { force: true }).catch(() => {});
      return sendJson(res, 200, {
        ok: true,
        elapsedMs: Date.now() - started,
        size: stat.size,
        summary,
        checks: [
          { name: 'FFmpeg 可执行', ok: true },
          { name: 'libx264 编码', ok: true },
          { name: 'AAC 编码', ok: true },
          { name: 'ffprobe 解析', ok: true },
          { name: '临时文件写入', ok: true }
        ]
      });
    } catch (error) {
      await fsp.rm(file, { force: true }).catch(() => {});
      return sendJson(res, 500, { ok: false, error: error.message });
    }
  }

  if (pathname === '/api/upload' && method === 'POST') {
    return handleUpload(req, res);
  }

  if (pathname === '/api/media' && method === 'GET') {
    const items = [...mediaStore.values()]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map(publicMedia);
    return sendJson(res, 200, { media: items });
  }

  const mediaDetail = pathname.match(/^\/api\/media\/([a-f0-9-]+)$/i);
  if (mediaDetail && method === 'GET') {
    const item = mediaStore.get(mediaDetail[1]);
    if (!item) return sendError(res, 404, '媒体不存在');
    return sendJson(res, 200, { media: publicMedia(item) });
  }
  if (mediaDetail && method === 'DELETE') {
    const item = mediaStore.get(mediaDetail[1]);
    if (!item) return sendError(res, 404, '媒体不存在');
    if ([...jobStore.values()].some((job) => job.mediaId === item.id && ['queued', 'running'].includes(job.status))) {
      return sendError(res, 409, '该媒体有进行中的任务，无法删除');
    }
    mediaStore.delete(item.id);
    await fsp.rm(path.join(MEDIA_DIR, `${item.id}.json`), { force: true }).catch(() => {});
    await fsp.rm(item.path, { force: true }).catch(() => {});
    await fsp.rm(path.join(THUMB_DIR, `${item.id}.jpg`), { force: true }).catch(() => {});
    await fsp.rm(path.join(THUMB_DIR, `${item.id}.png`), { force: true }).catch(() => {});
    return sendJson(res, 200, { ok: true });
  }

  const mediaThumb = pathname.match(/^\/api\/media\/([a-f0-9-]+)\/thumb$/i);
  if (mediaThumb && method === 'GET') {
    const item = mediaStore.get(mediaThumb[1]);
    if (!item) return sendError(res, 404, '媒体不存在');
    try {
      const thumb = await createThumb(item);
      return streamFile(req, res, thumb);
    } catch (error) {
      return sendError(res, 500, `缩略图生成失败：${error.message}`);
    }
  }

  const mediaFile = pathname.match(/^\/api\/media\/([a-f0-9-]+)\/file$/i);
  if (mediaFile && method === 'GET') {
    const item = mediaStore.get(mediaFile[1]);
    if (!item) return sendError(res, 404, '媒体不存在');
    return streamFile(req, res, item.path);
  }

  if (pathname === '/api/preview' && method === 'POST') {
    const body = await readJsonBody(req);
    const item = mediaStore.get(body.mediaId);
    if (!item) return sendError(res, 404, '媒体不存在');
    const operation = body.operation === 'edit' ? 'edit' : 'convert';
    try {
      const preview = createPreviewSpec(item, operation, body.settings || {});
      return sendJson(res, 200, preview);
    } catch (error) {
      return sendError(res, error.statusCode || 400, error.message);
    }
  }

  if (pathname === '/api/open-output' && method === 'POST') {
    if (!IS_WIN) return sendError(res, 501, '当前系统不支持此操作');
    try {
      spawn('explorer.exe', [OUTPUT_DIR], { detached: true, stdio: 'ignore', windowsHide: false }).unref();
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  }

  if (pathname === '/api/jobs' && method === 'POST') {
    const body = await readJsonBody(req);
    try {
      const jobs = await createJobs(body);
      return sendJson(res, 202, { jobs });
    } catch (error) {
      return sendError(res, error.statusCode || 400, error.message);
    }
  }

  if (pathname === '/api/jobs' && method === 'GET') {
    const status = searchParams.get('status');
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));
    let jobs = [...jobStore.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (status) jobs = jobs.filter((job) => job.status === status);
    jobs = jobs.slice(0, limit);
    const counts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    return sendJson(res, 200, { jobs: jobs.map(publicJob), counts });
  }

  const jobDetail = pathname.match(/^\/api\/jobs\/([a-f0-9-]+)$/i);
  if (jobDetail && method === 'GET') {
    const job = jobStore.get(jobDetail[1]);
    if (!job) return sendError(res, 404, '任务不存在');
    return sendJson(res, 200, { job: publicJob(job) });
  }
  if (jobDetail && method === 'DELETE') {
    const job = jobStore.get(jobDetail[1]);
    if (!job) return sendError(res, 404, '任务不存在');
    if (['queued', 'running'].includes(job.status)) return sendError(res, 409, '请先取消进行中的任务');
    jobStore.delete(job.id);
    await fsp.rm(path.join(JOB_DIR, `${job.id}.json`), { force: true }).catch(() => {});
    return sendJson(res, 200, { ok: true });
  }

  const jobCancel = pathname.match(/^\/api\/jobs\/([a-f0-9-]+)\/cancel$/i);
  if (jobCancel && method === 'POST') {
    const job = jobStore.get(jobCancel[1]);
    if (!job) return sendError(res, 404, '任务不存在');
    try {
      const result = await cancelJob(job);
      return sendJson(res, 200, { job: result });
    } catch (error) {
      return sendError(res, error.statusCode || 400, error.message);
    }
  }

  const jobDownload = pathname.match(/^\/api\/jobs\/([a-f0-9-]+)\/download$/i);
  if (jobDownload && method === 'GET') {
    const job = jobStore.get(jobDownload[1]);
    if (!job) return sendError(res, 404, '任务不存在');
    if (job.status !== 'completed' || !job.outputPath) return sendError(res, 409, '任务尚未完成');
    return streamFile(req, res, job.outputPath, { download: true, filename: job.outputName });
  }

  const jobReveal = pathname.match(/^\/api\/jobs\/([a-f0-9-]+)\/reveal$/i);
  if (jobReveal && method === 'POST') {
    const job = jobStore.get(jobReveal[1]);
    if (!job) return sendError(res, 404, '任务不存在');
    if (!job.outputPath) return sendError(res, 409, '任务尚无输出文件');
    if (!IS_WIN) return sendError(res, 501, '当前系统不支持此操作');
    try {
      spawn('explorer.exe', [`/select,${job.outputPath}`], { detached: true, stdio: 'ignore', windowsHide: false }).unref();
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  }

  return sendError(res, 404, '接口不存在');
}

async function serveStatic(req, res, url) {
  let relative = decodeURIComponent(url.pathname);
  if (relative === '/' || relative === '') relative = '/index.html';
  const resolved = path.resolve(PUBLIC_DIR, `.${relative}`);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== PUBLIC_DIR) {
    return sendError(res, 403, '禁止访问');
  }
  let stat;
  try { stat = await fsp.stat(resolved); } catch { return sendError(res, 404, '页面不存在'); }
  if (!stat.isFile()) return sendError(res, 404, '页面不存在');
  const body = await fsp.readFile(resolved);
  res.writeHead(200, {
    'Content-Type': contentTypeFor(resolved),
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
  });
  res.end(body);
}

async function handleRequest(req, res) {
  try {
    const host = req.headers.host || `127.0.0.1:${serverPort}`;
    const url = new URL(req.url || '/', `http://${host}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return await serveStatic(req, res, url);
  } catch (error) {
    log('请求处理失败', error.stack || error.message);
    if (!res.headersSent) sendError(res, error.statusCode || 500, error.message || '服务器内部错误');
    else res.destroy();
  }
}

function openBrowser(url) {
  try {
    if (IS_WIN) {
      spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch (error) {
    log('无法自动打开浏览器', error.message);
  }
}

function tryListen(server, port, attempts = 0) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempts < 20) {
      log(`端口 ${port} 已被占用，尝试 ${port + 1}`);
      serverPort = port + 1;
      setTimeout(() => tryListen(server, port + 1, attempts + 1), 60);
    } else {
      log('服务启动失败', error.message);
      process.exit(1);
    }
  });
  server.listen(port, '127.0.0.1', async () => {
    serverPort = port;
    const url = `http://127.0.0.1:${port}`;
    log(`${APP_NAME} v${APP_VERSION} 已启动：${url}`);
    try {
      await saveJson(path.join(DATA_DIR, 'server.json'), { pid: process.pid, port, startedAt: new Date().toISOString() });
    } catch {}
    if (process.argv.includes('--open') || process.env.FFSTUDIO_OPEN === '1') openBrowser(url);
  });
}

async function main() {
  ensureDirsSync();
  await initFFmpegInfo();
  await detectCapabilities();
  await loadState();
  log(`FFmpeg: ${ffmpegInfo.available ? ffmpegInfo.version : '未找到'}`);
  log(`数据目录: ${DATA_DIR}`);
  log(`任务并发: ${MAX_JOBS}`);
  const server = http.createServer(handleRequest);
  server.requestTimeout = 0;
  server.headersTimeout = 60000;
  tryListen(server, serverPort);
  setTimeout(pumpQueue, 800);
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log('正在关闭服务...');
  for (const [id, child] of activeChildren.entries()) {
    try { child.kill('SIGTERM'); } catch {}
    const job = jobStore.get(id);
    if (job) {
      job.status = 'failed';
      job.error = '服务关闭，任务已中断';
      job.finishedAt = new Date().toISOString();
      await persistJob(job).catch(() => {});
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (error) => log('未捕获异常', error.stack || error.message));
process.on('unhandledRejection', (error) => log('未处理 Promise', error?.stack || String(error)));

main().catch((error) => {
  log('启动失败', error.stack || error.message);
  process.exit(1);
});
