/* src/lib/scripts/about.ts
 * DASL-1.2 — (c) Clove Twilight
 */

const birthDate = new Date('2004-09-15T07:30:00');

export function calculateAge(current = new Date()) {
	let years = current.getFullYear() - birthDate.getFullYear();

	const birthday = new Date(
		current.getFullYear(),
		birthDate.getMonth(),
		birthDate.getDate(),
		birthDate.getHours(),
		birthDate.getMinutes(),
		birthDate.getSeconds(),
		birthDate.getMilliseconds()
	);

	if (current < birthday) {
		years--;
	}

	let months = current.getMonth() - birthDate.getMonth();

	if (current.getDate() < birthDate.getDate()) {
		months--;
	}

	if (months < 0) {
		months += 12;
	}

	return {
		years,
		months
	};
}
