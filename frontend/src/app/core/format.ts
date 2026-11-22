import type { Level } from './models';

/** 512 → "08:32"; 3725 → "1:02:05". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 2, '0');
  const ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "08:32" o "1:02:05" → segundos. Devuelve null si el formato no es válido. */
export function parseDuration(value: string): number | null {
  const parts = value.trim().split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.slice(1).some((n) => n > 59)) return null;
  return nums.reduce((acc, n) => acc * 60 + n, 0);
}

/** 26.5 h, 340 min... */
export function formatHours(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 120) return `${minutes} min`;
  return `${(minutes / 60).toFixed(1)} h`;
}

export const LEVEL_LABEL: Record<Level, string> = {
  secundaria: 'Secundaria',
  preparatoria: 'Preparatoria',
  universidad: 'Universidad',
};

export function initials(name: string): string {
  const words = name
    .replace(/^(Prof\.|Mtra\.|Mtro\.|Dra\.|Dr\.)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase();
}

export function isYouTube(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)\//i.test(url);
}

/** Devuelve la URL de embed de YouTube o null si no es un enlace de YouTube válido. */
export function youTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : null;
}
