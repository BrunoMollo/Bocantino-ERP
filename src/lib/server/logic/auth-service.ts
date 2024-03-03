import { eq } from 'drizzle-orm';
import { db } from '../db';
import { t_user } from '../db/schema';
import { logic_error } from '$logic';
import bcrypt from 'bcrypt';
import { getFirst, getFirstIfPosible, type Prettify } from '$lib/utils';

import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from '$env/static/private';
import { SignJWT, jwtVerify } from 'jose';

export type Payload = { id: number };

export class AuthService {
	async signJWT(payload: Payload, options: { exp: string }) {
		const secret = new TextEncoder().encode(JWT_SECRET_KEY);
		const alg = 'HS256';
		return new SignJWT(payload)
			.setProtectedHeader({ alg })
			.setExpirationTime(options.exp)
			.setIssuedAt()
			.setSubject(payload.id.toString())
			.sign(secret);
	}

	async verifyJWT(token: string) {
		try {
			const payload = (await jwtVerify(token, new TextEncoder().encode(JWT_SECRET_KEY)))
				.payload as Prettify<Payload>;
			return { payload, type: 'SUCCESS' } as const;
		} catch (error) {
			return {
				type: 'AUTH_ERROR'
			} as const;
		}
	}

	async login(recived_user: { username: string; password: string }) {
		const db_user = await db
			.select()
			.from(t_user)
			.where(eq(t_user.username, recived_user.username))
			.then(getFirstIfPosible);

		if (!db_user) {
			return logic_error('Uusario no encontrado');
		}

		const hash_match = await bcrypt.compare(recived_user.password, db_user.password_hash);
		if (!hash_match) {
			return logic_error('constraseña incorrecta');
		}

		const token = await this.signJWT({ id: db_user.id }, { exp: `${JWT_EXPIRES_IN}m` });

		return { token, type: 'SUCCESS' } as const;
	}

	async createUser(user: { username: string; password: string }) {
		const { username, password } = user;
		const user_already_exist = await db
			.select()
			.from(t_user)
			.where(eq(t_user.username, username))
			.then((x) => x.length)
			.then((x) => !!x);

		if (user_already_exist) {
			return logic_error('nombre de usario ya existe');
		}

		const { id } = await db
			.insert(t_user)
			.values({ username, password_hash: await bcrypt.hash(password, 10) })
			.returning({ id: t_user.id })
			.then(getFirst);

		return { id, type: 'SUCCESS' };
	}
}

export const auth_service = new AuthService();
