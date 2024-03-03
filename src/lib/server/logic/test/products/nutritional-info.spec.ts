import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { nutritional_information_service } from '$logic/nutricional-information-service';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { __DELETE_ALL_DATABASE } from '../utils';

vi.mock('$lib/server/db/index.ts');

beforeEach(async () => {
	await __DELETE_ALL_DATABASE();
});

describe('nutritional information of a product', () => {
	test('case 1', async () => {
		const LIVER_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 10,
			nutrient_fat: 8,
			nutrient_carb: 1
		});
		const RICE_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 2,
			nutrient_fat: 1,
			nutrient_carb: 10
		});
		const info = await nutritional_information_service.calculateNutricionalInformation([
			{ ingredient_id: LIVER_ID, amount: 2 },
			{ ingredient_id: RICE_ID, amount: 10 }
		]);
		//@ts-expect-error PENDING: explain
		expect(info.data).toEqual({
			nutrient_protein: 10 * 2 + 2 * 10,
			nutrient_fat: 8 * 2 + 1 * 10,
			nutrient_carb: 1 * 2 + 10 * 10,
			nutrient_ashes: 0,
			nutrient_fiber: 0,
			nutrient_calcium: 0,
			nutrient_sodium: 0,
			nutrient_humidity: 0,
			nutrient_phosphorus: 0
		});
	});

	test('case 2', async () => {
		const LIVER_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 1,
			nutrient_fat: 2,
			nutrient_carb: 3
		});
		const RICE_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 1,
			nutrient_fat: 2,
			nutrient_carb: 3
		});
		const POTATOE_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 1,
			nutrient_fat: 2,
			nutrient_carb: 3
		});
		const info = await nutritional_information_service.calculateNutricionalInformation([
			{ ingredient_id: LIVER_ID, amount: 10 },
			{ ingredient_id: RICE_ID, amount: 10 },
			{ ingredient_id: POTATOE_ID, amount: 10 }
		]);
		//@ts-expect-error PENDING: explain
		expect(info.data).toEqual({
			nutrient_protein: 1 * 3 * 10,
			nutrient_fat: 2 * 3 * 10,
			nutrient_carb: 3 * 3 * 10,
			nutrient_ashes: 0,
			nutrient_fiber: 0,
			nutrient_calcium: 0,
			nutrient_sodium: 0,
			nutrient_humidity: 0,
			nutrient_phosphorus: 0
		});
	});

	test('case 3', async () => {
		const LIVER_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 2,
			nutrient_fat: 2,
			nutrient_carb: 3
		});
		const RICE_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 2,
			nutrient_fat: 2,
			nutrient_carb: 3
		});
		//no used in recipe
		await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 20,
			nutrient_fat: 20,
			nutrient_carb: 30
		});
		const info = await nutritional_information_service.calculateNutricionalInformation([
			{ ingredient_id: LIVER_ID, amount: 1 },
			{ ingredient_id: RICE_ID, amount: 1 }
		]);

		//@ts-expect-error PENDING: explain
		expect(info.data).toEqual({
			nutrient_protein: 2 + 2,
			nutrient_fat: 2 + 2,
			nutrient_carb: 3 + 3,
			nutrient_ashes: 0,
			nutrient_fiber: 0,
			nutrient_calcium: 0,
			nutrient_sodium: 0,
			nutrient_humidity: 0,
			nutrient_phosphorus: 0
		});
	});

	test('case 4', async () => {
		const LIVER_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 4,
			nutrient_fat: 5,
			nutrient_carb: 6
		});
		const info = await nutritional_information_service.calculateNutricionalInformation([
			{ ingredient_id: LIVER_ID, amount: 1 }
		]);
		//@ts-expect-error PENDING: explain
		expect(info.data).toEqual({
			nutrient_protein: 4,
			nutrient_fat: 5,
			nutrient_carb: 6,
			nutrient_ashes: 0,
			nutrient_fiber: 0,
			nutrient_calcium: 0,
			nutrient_sodium: 0,
			nutrient_humidity: 0,
			nutrient_phosphorus: 0
		});
	});

	test('error when repeted ingredient in more then one line', async () => {
		const LIVER_ID = await ingredient_defaulter_service.add_simple_with_nutrients({
			nutrient_protein: 4,
			nutrient_fat: 5,
			nutrient_carb: 6
		});
		const info = await nutritional_information_service.calculateNutricionalInformation([
			{ ingredient_id: LIVER_ID, amount: 1 },
			{ ingredient_id: LIVER_ID, amount: 1 }
		]);
		expect(info.type).toEqual('LOGIC_ERROR');
	});
});
