export const getFirst = <T>(x: Array<T>) => x[0];

type DateString = string & { __pattern: 'yyyy-mm-dd' };
/**
 * Check if a given string can make a calid date, following the html standar given by the date input (yyyy-mm-dd)
 * Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#technical_summary
 **/
export function isValidDateBackend(str: string): str is DateString {
	if (str.length !== 10) {
		return false;
	}
	const splited = str.split('-');
	if (splited.length !== 3) {
		return false;
	}

	if (splited[0].length != 4) {
		return false;
	}
	if (splited[1].length != 2) {
		return false;
	}
	if (splited[2].length != 2) {
		return false;
	}
	const year = parseInt(splited[0], 10);
	const month = parseInt(splited[1], 10);
	const day = parseInt(splited[2], 10);

	if (day < 1 || month < 1 || year < 1) {
		return false;
	}

	const date = new Date(year, month - 1, day);

	const makesSense =
		date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
	return makesSense;
}

export function parseStringToDate(str: DateString) {
	const splited = str.split('-');
	const year = parseInt(splited[0], 10);
	const month = parseInt(splited[1], 10);
	const day = parseInt(splited[2], 10);
	return new Date(year, month - 1, day);
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
 **/
export type TableInsert<T, O extends keyof T | ''> = Prettify<O extends '' ? T : Omit<T, O>>;

/**
 * This function is a helper to organize an array to be consumed by the Autocomplete component
 *
 *<pre>
 *<script lang="ts">
 *  const optionsDocumentTypes = makeOptions(data.documentTypes, { value: 'id', label: 'desc' });
 *</script>
 *<Autocomplete name="tipe_of_document"{...optionsDocumentTypes}/>
 *
 *</pre>
 *
 **/
export function makeOptions<T>(arr: T[], fields: { label: keyof T; value: keyof T }) {
	const { label, value } = fields;
	return arr.reduce(
		(prev, curr) => {
			prev.values.push(curr[value]);
			prev.labels.push(curr[label]);
			return prev;
		},
		{ labels: [] as any[], values: [] as any[] }
	);
}

