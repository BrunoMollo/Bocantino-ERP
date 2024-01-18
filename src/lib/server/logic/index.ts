import * as ingredients_logic from './ingredients-logic';
export const ingredients_service = ingredients_logic;

import * as suppliers_logic from './suppliers-logic';
export const suppliers_service = suppliers_logic;

import * as purchases_logic from './purchases-logic';
export const purchases_service = purchases_logic;

import * as ingredient_production_logic from './ingredient-production-logic';
export const ingredient_production_service = ingredient_production_logic;

import * as auth_logic from './auth';
export const auth_service = auth_logic;

type LogicError = { type: 'LOGIC_ERROR'; message: string };
export function logicError(message: string): LogicError {
	console.error(message);
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

