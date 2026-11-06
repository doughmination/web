/* src/lib/server/visitors.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Live visitor count: every open tab holds an event stream (routes/api/visitors),
// and tabs sharing a visitor id count once, so one person with five tabs is one
// visitor. It's all in memory, which is fine for a single server process; the
// count just starts again from whoever reconnects after a restart.

type Send = (count: number) => void;

// Hard cap on open streams, so nobody can run the server out of connections
export const MAX_TABS = 500;

const tabs = new Map<Send, string>();
let last = 0;

function count(): number {
	return new Set(tabs.values()).size;
}

// Tell every tab, but only when the number actually moved. Returns whether it did
function broadcast(): boolean {
	const n = count();
	if (n === last) return false;
	last = n;
	for (const send of tabs.keys()) send(n);
	return true;
}

export function isFull(): boolean {
	return tabs.size >= MAX_TABS;
}

// Adds a tab and sends it the current count straight away; returns the function
// that removes it again (safe to call more than once)
export function join(visitorId: string, send: Send): () => void {
	tabs.set(send, visitorId);
	// Another tab of someone already here doesn't change the count, but the new
	// tab still needs to hear it
	if (!broadcast()) send(last);
	return () => {
		if (tabs.delete(send)) broadcast();
	};
}
