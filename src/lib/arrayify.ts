import type { Column } from 'drizzle-orm';
import { string } from 'zod';

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export function copy_column<
	T extends any[],
	FROM extends keyof T[0],
	FIELD extends keyof NonNullable<T[0][FROM]>,
	TO extends Exclude<keyof T[0], FROM>
>(obj: { from: FROM; field: FIELD; to: TO }) {
	return (resulset: T) => {
		const { from, field, to } = obj;
		return resulset.map((x) => {
			if (x[from]) {
				x[to][field] = x[from][field];
			}
			return x as {
				[KEY in keyof T[0]]: KEY extends TO
					? Prettify<T[0][KEY] & { [k in FIELD]: NonNullable<T[0][FROM]>[FIELD] }>
					: Prettify<T[0][KEY]>;
			};
		});
	};
}

export const arrayify =
	<
		T extends any[],
		MANY extends Exclude<keyof T[0], MAIN>,
		MAIN extends keyof T[0],
		ONE extends Exclude<keyof T[0], MAIN | MANY>
	>(obj: {
		one: { table: MAIN; id?: keyof T[0][MAIN] };
		with_many?: {
			table: MANY;
			id?: string;
		}[];
		with_one?: {
			table: ONE;
		}[];
	}) =>
	(resulset: T) => {
		const { one, with_many, with_one } = obj;
		if (!one.id) {
			one.id = 'id';
		}
		const indetifiers = [...new Set(resulset.map((x) => x[one.table][one.id]))];

		const maped = [];
		for (let id of indetifiers) {
			const row_one = resulset.map((x) => x[one.table]).find((x) => x[one.id] === id);

			for (let o of with_one ?? []) {
				row_one[o.table] = resulset
					.filter((x) => x[one.table][one.id] === id)
					.map((x) => x[o.table])[0];
			}

			for (let m of with_many ?? []) {
				const seen = new Map();

				row_one[m.table] = resulset
					.filter((x) => x[one.table][one.id] === id)
					.map((x) => {
						return x[m.table];
					})
					.filter((x) => {
						if (!x) return false;

						if (seen.get(x[m.id ?? 'id'])) {
							return false;
						} else {
							seen.set(x[m.id ?? 'id'], true);
							return true;
						}
					});
			}

			if (row_one) {
				maped.push(row_one);
			}
		}
		return maped as Prettify<
			T[0][MAIN] & { [key in MANY]: Exclude<T[0][key], null>[] } & {
				[key in ONE]: Exclude<T[0][key], null>;
			}
		>[];
	};

export function pick_columns<T extends Object, C extends keyof T>(
	table: T,
	columns: (C | { col: C; as: string })[]
) {
	const map = new Map();
	for (let c of columns) {
		if (c instanceof Object) {
			map.set(c.as, table[c.col]);
		} else {
			map.set(c, table[c]);
		}
	}
	return Object.fromEntries(map) as { [k in C]: T[k] };
}

