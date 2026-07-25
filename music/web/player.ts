// Controller around a single <audio> element, with shuffle, repeat, volume.
// User prefs (volume / shuffle / repeat) persist in localStorage.

import type { Song } from "./api.ts";

export type RepeatMode = "off" | "all" | "one";

const PREFS_KEY = "music:prefs";

type Prefs = {
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
};

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { volume: 1, shuffle: false, repeat: "off", ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { volume: 1, shuffle: false, repeat: "off" };
}

export class Player {
  private audio = new Audio();
  private queue: Song[] = []; // playback order (shuffled or not)
  private index = -1;
  private prefs: Prefs = loadPrefs();
  // iOS ignores HTMLMediaElement.volume (hardware-controlled). Detect so the
  // UI can hide the volume slider there.
  readonly volumeSupported = !isIOS();

  onChange: (() => void) | null = null;
  onError: ((msg: string) => void) | null = null;

  constructor() {
    this.audio.volume = this.prefs.volume;
    // iOS needs these: inline playback + the element attached to the document.
    this.audio.preload = "metadata";
    this.audio.setAttribute("playsinline", "");
    this.audio.setAttribute("webkit-playsinline", "");
    this.audio.setAttribute("controlsList", "nodownload");
    if (typeof document !== "undefined") {
      this.audio.style.display = "none";
      document.body.appendChild(this.audio);
    }

    this.audio.addEventListener("ended", () => this.onEnded());
    this.audio.addEventListener("timeupdate", () => this.onChange?.());
    this.audio.addEventListener("play", () => this.onChange?.());
    this.audio.addEventListener("pause", () => this.onChange?.());
    this.audio.addEventListener("volumechange", () => this.onChange?.());
    this.audio.addEventListener("error", () => {
      const err = this.audio.error;
      if (err) this.onError?.(`Audio error (code ${err.code})`);
    });
  }

  get current(): Song | null {
    return this.queue[this.index] ?? null;
  }

  get playing(): boolean {
    return !this.audio.paused;
  }

  get volume(): number {
    return this.prefs.volume;
  }

  get shuffle(): boolean {
    return this.prefs.shuffle;
  }

  get repeat(): RepeatMode {
    return this.prefs.repeat;
  }

  get progress(): { current: number; duration: number } {
    return {
      current: this.audio.currentTime || 0,
      duration: this.audio.duration || 0,
    };
  }

  // Start a fresh queue. `startAt` indexes into `songs` as given; if shuffle is
  // on, that song plays first and the rest are shuffled after it.
  playQueue(songs: Song[], startAt = 0): void {
    if (this.prefs.shuffle) {
      const first = songs[startAt];
      const rest = songs.filter((_, i) => i !== startAt);
      this.queue = first ? [first, ...shuffleArray(rest)] : shuffleArray(rest);
      this.index = 0;
    } else {
      this.queue = songs.slice();
      this.index = startAt;
    }
    this.load();
  }

  toggle(): void {
    if (this.audio.paused) this.tryPlay();
    else this.audio.pause();
  }

  next(): void {
    if (this.index < this.queue.length - 1) {
      this.index++;
      this.load();
    } else if (this.prefs.repeat === "all" && this.queue.length > 0) {
      this.index = 0;
      this.load();
    }
  }

  prev(): void {
    // Restart the track if we're more than 3s in; otherwise go back one.
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    if (this.index > 0) {
      this.index--;
      this.load();
    }
  }

  seek(seconds: number): void {
    this.audio.currentTime = seconds;
  }

  setVolume(v: number): void {
    this.prefs.volume = Math.min(1, Math.max(0, v));
    this.audio.volume = this.prefs.volume;
    this.save();
  }

  toggleShuffle(): void {
    this.prefs.shuffle = !this.prefs.shuffle;
    this.save();
    this.onChange?.();
  }

  cycleRepeat(): void {
    const order: RepeatMode[] = ["off", "all", "one"];
    const nextIdx = (order.indexOf(this.prefs.repeat) + 1) % order.length;
    this.prefs.repeat = order[nextIdx]!;
    this.save();
    this.onChange?.();
  }

  private onEnded(): void {
    if (this.prefs.repeat === "one") {
      this.audio.currentTime = 0;
      this.tryPlay();
      return;
    }
    this.next();
  }

  private load(): void {
    const song = this.current;
    if (!song) return;
    this.audio.src = song.streamUrl;
    this.audio.volume = this.prefs.volume;
    this.audio.load(); // iOS: explicit load before play
    this.tryPlay();
    this.onChange?.();
  }

  // Play and surface any autoplay/permission error (mainly for iOS).
  private tryPlay(): void {
    const p = this.audio.play();
    if (p && typeof p.catch === "function") {
      p.catch((err: unknown) => {
        const name = (err as { name?: string })?.name ?? "Error";
        this.onError?.(`Can't play (${name})`);
      });
    }
  }

  private save(): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      /* ignore */
    }
  }
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone/iPod/iPad, plus iPadOS 13+ which reports as Mac with touch.
  return (
    /iP(hone|od|ad)/.test(ua) ||
    (ua.includes("Macintosh") && "ontouchend" in document)
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
