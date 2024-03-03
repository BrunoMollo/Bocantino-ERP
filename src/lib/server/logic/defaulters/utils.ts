import crypto from 'crypto';

export function some_string() {
	return crypto.randomBytes(4).toString('hex');
}
