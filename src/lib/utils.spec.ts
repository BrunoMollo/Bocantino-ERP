import { describe, expect, test } from 'vitest';
import { isValidDateBackend } from './utils';

describe('isValidDate', () => {
	describe('valid cases', () => {
		test.each([
			{ str: '2020-12-12' },
			{ str: '2000-12-12' },
			{ str: '2020-01-12' },
			{ str: '2020-12-01' },
			{ str: '1220-01-13' },
			{ str: '9999-12-31' },
			{ str: '0100-01-01' }
		])('isValidDate($str)->true', ({ str }) => {
			expect(isValidDateBackend(str)).toBe(true);
		});
	});

	describe('invalid cases', () => {
		test.each([
			{ str: '' },
			{ str: 'Gracias Brozzo por enseñarme casos de prueba' },
			{ str: 'Te queremos mucho Aldo!!' },
			{ str: '1111-11-1' },
			{ str: '1111-11-' },
			{ str: '1111-1-11' },
			{ str: '1111--1' },
			{ str: '1111-1' },
			{ str: '111-11-1' },
			{ str: '11-11-1' },
			{ str: '1-11-1' },
			{ str: '-11-1' },
			{ str: '1-1-1' },
			{ str: '2000-02-30' },
			{ str: '2000-02-31' },
			{ str: '2000-04-31' },
			{ str: '2000-03-01-' },
			{ str: '-2000-03-01' },
			{ str: '2000--03-01' },
			{ str: '2000-03--01' },
			{ str: '2000--03--01' },
			{ str: '20-00-03-01' },
			{ str: '-2000--03-01' },
			{ str: '-2000--03--01' }
		])('isValidDate($str)->false', ({ str }) => {
			expect(isValidDateBackend(str)).toBe(false);
		});
	});
});
