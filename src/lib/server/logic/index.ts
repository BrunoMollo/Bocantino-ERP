import * as ingredients_logic from './ingredients';
export const ingredients_service = ingredients_logic;

import * as suppliers_logic from './suppliers';
export const suppliers_service = suppliers_logic;

type LogicError = { type: 'LOGIC_ERROR'; message: string };
export function logicError(message: string): LogicError {
	return {
		type: 'LOGIC_ERROR' as const,
		message
	};
}

