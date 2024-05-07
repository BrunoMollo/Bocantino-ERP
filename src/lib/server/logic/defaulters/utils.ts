import { generateUUID } from '$lib/utils';

export function some_string() {
	return generateUUID();
}

export function someDate() {
	const startDate = new Date(2000, 0, 1); // January 1, 2000
	const endDate = new Date(2030, 0, 1); // January 1, 2030

	const startMillis = startDate.getTime();
	const endMillis = endDate.getTime();
	const randomMillis = startMillis + Math.random() * (endMillis - startMillis);

	return new Date(randomMillis);
}

/**
 * This funtion is only for testing
 * */
export function justDate(date: Date | null) {
	if (date) return date.toISOString().split('T')[0];
	else return 'is null';
}
