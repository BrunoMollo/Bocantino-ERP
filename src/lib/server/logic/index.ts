export function logic_error(message: string) {
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
