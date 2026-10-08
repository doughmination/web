/* src/lib/scripts/heatmap.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Contribution heatmap: daily counts from every Git host I use, merged into
// GitHub-style weeks (Sunday to Saturday, UTC)

import { API_BASE } from '#lib/scripts/discord.ts';
import { cached } from '#lib/scripts/cache.ts';

export interface Day {
	date: string;
	contributions: number;
	sources: Record<string, number>;
}

export type Week = Day[];

export interface Contributions {
	weeks: Week[];
	total: number;
	since: string | null;
}

interface SourceDay {
	timestamp: number;
	contributions: number;
}

export const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

function sundayOf(date: Date | number): Date {
	const sunday = new Date(date);
	sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
	sunday.setUTCHours(0, 0, 0, 0);
	return sunday;
}

// This week is cut off at today, so the grid doesn't show future days
function emptyWeek(sunday: Date): Week {
	const isThisWeek = sunday.getTime() === sundayOf(new Date()).getTime();
	const days = isThisWeek ? new Date().getUTCDay() + 1 : 7;
	return Array.from({ length: days }, (_, i) => {
		const d = new Date(sunday);
		d.setUTCDate(d.getUTCDate() + i);
		return { date: d.toISOString().slice(0, 10), contributions: 0, sources: {} };
	});
}

function toWeeks(sources: Record<string, SourceDay[]>): Week[] {
	const weeks = new Map<number, Week>();
	for (const [name, days] of Object.entries(sources)) {
		for (const day of days ?? []) {
			const sunday = sundayOf(day.timestamp * 1000);
			let week = weeks.get(sunday.getTime());
			if (!week) {
				week = emptyWeek(sunday);
				weeks.set(sunday.getTime(), week);
			}
			const slot = week[new Date(day.timestamp * 1000).getUTCDay()];
			if (!slot || day.contributions <= 0) continue;
			slot.contributions += day.contributions;
			slot.sources[name] = (slot.sources[name] ?? 0) + day.contributions;
		}
	}
	return [...weeks.entries()].sort(([a], [b]) => a - b).map(([, week]) => week);
}

export function fetchContributions(): Promise<Contributions> {
	return cached('contributions', loadContributions, { ttl: 30 * 60_000 });
}

async function loadContributions(): Promise<Contributions> {
	const res = await fetch(`${API_BASE}/v2/contribapi`);
	const body = (await res.json()) as { success: boolean; data?: Record<string, SourceDay[]> };
	if (!body.success || !body.data) throw new Error(`Request failed (${res.status})`);
	const weeks = toWeeks(body.data);
	const total = weeks.flat().reduce((sum, day) => sum + day.contributions, 0);
	return { weeks, total, since: weeks[0]?.[0]?.date ?? null };
}

export function level(n: number): number {
	if (n === 0) return 0;
	if (n < 3) return 1;
	if (n < 6) return 2;
	if (n < 10) return 3;
	return 4;
}

export function monthOf(week: Week): number {
	return new Date(week[0].date + 'T00:00:00Z').getUTCMonth();
}

export function dayTitle(day: Day): string {
	const breakdown = Object.entries(day.sources)
		.map(([name, n]) => `${name}: ${n}`)
		.join(', ');
	const count = `${day.contributions} contribution${day.contributions === 1 ? '' : 's'}`;
	return `${count} on ${day.date}${breakdown ? ` (${breakdown})` : ''}`;
}
