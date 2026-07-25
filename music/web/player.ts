// Thin controller around a single <audio> element.

import type { Song } from "./api.ts";

export class Player {
  private audio = new Audio();
  private queue: Song[] = [];
  private index = -1;

  onChange: (() => void) | null = null;

  constructor() {
    this.audio.addEventListener("ended", () => this.next());
    this.audio.addEventListener("timeupdate", () => this.onChange?.());
    this.audio.addEventListener("play", () => this.onChange?.());
    this.audio.addEventListener("pause", () => this.onChange?.());
  }

  get current(): Song | null {
    return this.queue[this.index] ?? null;
  }

  get playing(): boolean {
    return !this.audio.paused;
  }

  get progress(): { current: number; duration: number } {
    return {
      current: this.audio.currentTime || 0,
      duration: this.audio.duration || 0,
    };
  }

  playQueue(songs: Song[], startAt = 0): void {
    this.queue = songs;
    this.index = startAt;
    this.load();
  }

  toggle(): void {
    if (this.audio.paused) void this.audio.play();
    else this.audio.pause();
  }

  next(): void {
    if (this.index < this.queue.length - 1) {
      this.index++;
      this.load();
    }
  }

  prev(): void {
    if (this.index > 0) {
      this.index--;
      this.load();
    }
  }

  seek(seconds: number): void {
    this.audio.currentTime = seconds;
  }

  private load(): void {
    const song = this.current;
    if (!song) return;
    this.audio.src = song.streamUrl;
    void this.audio.play();
    this.onChange?.();
  }
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
