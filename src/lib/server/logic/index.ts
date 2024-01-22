import * as ingredients_logic from './ingredients-logic';
export const ingredients_service = ingredients_logic;

import * as purchases_logic from './purchases-logic';
export const purchases_service = purchases_logic;

import * as ingredient_production_logic from './ingredient-production-logic';
export const ingredient_production_service = ingredient_production_logic;

export function logicError(message: string) {
	return {
		type: 'LOGIC_ERROR' as const,
		message
	};
}

export function is_ok<T>(data: T) {
	return {
		type: 'SUCCESS' as const,
		data
	};
}

