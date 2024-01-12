import { eq } from 'drizzle-orm';
import { db } from '../db';
import { t_user } from '../db/schema';
import { logicError } from '$logic';
import bcrypt from 'bcrypt';
import { getFirst } from '$lib/utils';

import { JWT_SECRET_KEY } from '$env/static/private';
import { SignJWT, jwtVerify } from 'jose';

const signJWT = async (payload: { sub: string }, options: { exp: string }) => {
	try {
		const secret = new TextEncoder().encode(JWT_SECRET_KEY);
		const alg = 'HS256';
		return new SignJWT(payload)
			.setProtectedHeader({ alg })
			.setExpirationTime(options.exp)
			.setIssuedAt()
			.setSubject(payload.sub)
			.sign(secret);
	} catch (error) {
		throw error;
	}
};

const verifyJWT = async <T>(token: string): Promise<T> => {
	try {
		return (await jwtVerify(token, new TextEncoder().encode(JWT_SECRET_KEY))).payload as T;
	} catch (error) {
		console.log(error);
		throw new Error('Your token has expired.');
	}
};

export async function createUser(user: { username: string; password: string }) {
	const { username, password } = user;
	const user_already_exist = await db
		.select()
		.from(t_user)
		.where(eq(t_user.username, username))
		.then((x) => x.length)
		.then((x) => !!x);

	if (user_already_exist) {
		return logicError('nombre de usario ya existe');
	}

	const { id } = await db
		.insert(t_user)
		.values({ username, password_hash: await bcrypt.hash(password, 10) }) //TODO: investigate further
		.returning({ id: t_user.id })
		.then(getFirst);

	return { id, type: 'SUCCESS' };
}

