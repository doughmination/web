/* src/lib/scripts/visitors.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Live visitor count, streamed from routes/api/visitors. Like the Discord
// socket, one stream stays open for the whole visit; EventSource reconnects by
// itself if it drops.

const listeners = new Set<(count: number) => void>();
let source: EventSource | null = null;
let latest: number | null = null;

// Kept in localStorage so all of one person's tabs count once. Private windows
// or blocked storage just get a fresh id per tab
function visitorId(): string {
	try {
		let id = localStorage.getItem('visitor-id');
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem('visitor-id', id);
		}
		return id;
	} catch {
		return crypto.randomUUID();
	}
}

function connect() {
	source = new EventSource(`/api/visitors?id=${encodeURIComponent(visitorId())}`);
	source.onmessage = (event) => {
		const n = Number(event.data);
		if (!Number.isInteger(n) || n < 0) return;
		latest = n;
		for (const l of listeners) l(n);
	};
}

// Calls onCount with the latest count right away if there is one, then on every
// change. Returns a function that stops listening; the stream stays open.
export function subscribeVisitors(onCount: (count: number) => void): () => void {
	listeners.add(onCount);
	if (latest !== null) onCount(latest);
	if (!source && typeof EventSource !== 'undefined') connect();
	return () => listeners.delete(onCount);
}
