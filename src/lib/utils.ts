export const getFirst = <T>(x: Array<T>) => x[0];
export const getFirstIfPosible = <T>(x: Array<T>) => x[0] as T | undefined;

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

export const by =
	<T extends object>(k: keyof T) =>
	(a: T, b: T) =>
		Number(a[k]) - Number(b[k]);
/**
 * Type Helper to show nicer types
 * Source: https://www.totaltypescript.com/concepts/the-prettify-helper
 **/
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & object;

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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ labels: [] as any[], values: [] as any[] }
	);
}

/**
 * helper to pares id from a param
 **/
export function parse_id_param(params: { id?: string }) {
	const id = Number(params.id);
	if (isNaN(id) || id < 0) {
		throw error(400, { message: 'invalid id' });
	}
	return { id };
}

import { goto } from '$app/navigation';
import { error, type Page } from '@sveltejs/kit';
import { writable, type Readable } from 'svelte/store';
import type { ZodValidation } from 'sveltekit-superforms';
import type { SuperForm } from 'sveltekit-superforms/client';
import type { AnyZodObject } from 'zod';
type SuperFormData<T extends ZodValidation<AnyZodObject>> = SuperForm<T>['form'];
export function startAs<T extends ZodValidation<AnyZodObject>>(
	form: SuperFormData<T>,
	key: keyof T['_type'],
	value: unknown
) {
	form.update(
		($form) => {
			//@ts-expect-error PENDING: explain
			$form[key] = value;
			return $form;
		},
		{ taint: false }
	);
}

export function derivedAsync<T, R>(store: Readable<T>, func: (x: T) => Promise<R>) {
	const deriv = writable<R | 'WAITING'>(undefined);
	store.subscribe(($value) => {
		deriv.set('WAITING');
		func($value).then(deriv.set);
	});
	return deriv;
}

/**
 * This function is a helper to implement the exaustive shiwtch pattern
 **/
export function should_not_reach(para: never) {
	throw Error(para);
}

/**
 * return true if array has repeted items
 **/
export function has_repeted<T>(arr: T[]) {
	return [...new Set(arr)].length != arr.length;
}

/**
 * return an array without repited elements
 **/
export function only_unique<T>(arr: T[]) {
	return [...new Set(arr)];
}

/**
 * Chech if a certain element is nullish with a type guard
 * More information in [this article](https://www.benmvp.com/blog/filtering-undefined-elements-from-array-typescript)
 **/
export function is_not_nullish<T>(item: T | undefined): item is NonNullable<T> {
	return !!item;
}

/**
 * This functions is needed becasue Vercel does not suport Node 20 yet, so we do not have the crypto module
 **/
export function generateUUID() {
	const randomHex = () => Math.floor(Math.random() * 16).toString(16);

	let uuid = '';
	for (let i = 0; i < 32; i++) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		uuid += randomHex();
	}

	return uuid;
}

/*
 * This function gives an object with the filters and a function to execute
 * the filteirng (interface adapted to be used with Skeleton's Paginator).
 * */
export function make_filter_by_url<K extends string>(
	fields: K[],
	$page: Page<Record<string, string>, string | null>
) {
	const query = new URLSearchParams($page.url.searchParams.toString());

	const filters = {} as Record<K | 'page', string | null>;

	for (const key of fields) {
		filters[key] = $page.url.searchParams.get(key);
	}

	filters['page'] = $page.url.searchParams.get('page');

	const filter = async (page?: { detail: number }) => {
		for (const key of fields) {
			const value = filters[key];
			if (value) {
				query.set(key, value);
			} else {
				query.delete(key);
			}
		}
		if (page) {
			filters.page = page.detail.toString();
			query.set('page', filters.page);
		}
		await goto(`?${query.toString()}`);
	};

	return { filters, filter };
}

/**
 * Rounds a number to a certain number of decimal points.
 */
export function round(
	number: number,
	decimalPoints: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
): number {
	const factor = Math.pow(10, decimalPoints);
	return Math.round(number * factor) / factor;
}
