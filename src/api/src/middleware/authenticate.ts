import { badRequest } from '@hapi/boom';
import { Request, Response, NextHandler } from 'polka';
import postgres from 'postgres';
import { container } from 'tsyringe';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

import { kSQL } from '../tokens';
import { discordOAuth2 } from '../util';

interface TokenData {
	sub: string;
}

export interface OAuthInfo {
	token: string;
	userId: string;
}

export default async (req: Request, _: Response, next?: NextHandler) => {
	if (req.headers.cookie) {
		const sql = container.resolve<postgres.Sql<any>>(kSQL);
		const cookies = cookie.parse(req.headers.cookie) as { token: string };

		let decoded: TokenData;
		try {
			decoded = jwt.verify(cookies.token, process.env.JWT_SECRET!) as TokenData;

			req.oauth = { token: cookies.token, userId: decoded.sub };
			return next?.();
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				const { sub } = jwt.decode(cookies.token) as TokenData;
				const [connection] = await sql<{ refresh_token: string }>`
					select refresh_token
					from connections
					where user_id = ${sub}
						and provider = "Discord";`;

				const response = await discordOAuth2({ refreshToken: connection.refresh_token });
				await sql`
					update connections
					set access_token = ${response.access_token},
						refresh_token = ${response.refresh_token},
						expires_at = ${new Date(Date.now() + response.expires_in * 1000)}
					where user_id = ${sub}
						and provider = "Discord";`;

				const token = jwt.sign(
					{
						provider: 'Discord',
						access_token: response.access_token,
						'https://hasura.io/jwt/claims': {
							'x-hasura-allowed-roles': ['user', 'mod', 'admin'],
							'x-hasura-default-role': 'user',
							'x-hasura-user-id': sub,
						},
					},
					process.env.JWT_SECRET!,
					{
						expiresIn: response.expires_in,
					},
				);
				req.oauth = { token, userId: sub };
				return next?.();
			}

			return next?.(badRequest('Malformed or missing JWT'));
		}
	}

	return next?.(badRequest('Malformed or missing JWT'));
};
