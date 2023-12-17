import type { InferInsertModel, Table } from 'drizzle-orm';

export const getFirst = <T>(x: Array<T>) => x[0];

export function isValidDate(day: string, month: string, year: string) {
	// Convert strings to numbers
	const dayNum = parseInt(day, 10);
	const monthNum = parseInt(month, 10);
	const yearNum = parseInt(year, 10);

	// Create a Date object using the provided values
	const date = new Date(yearNum, monthNum - 1, dayNum);

	// Check if the input values match the components of the created date
	return (
		date.getFullYear() === yearNum && date.getMonth() === monthNum - 1 && date.getDate() === dayNum
	);
}

/**
 * Type Helper to show nicer types
 * Source: https://www.totaltypescript.com/concepts/the-prettify-helper
 **/
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

/**
 * Type Helper to creates dtos from tables of the drizzle schema
 * T:
 **/
export type TableInsert<T, O extends keyof T> = Prettify<Omit<T, O>>;

