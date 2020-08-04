import { badRequest } from '@hapi/boom';
import { Request, Response, NextHandler } from 'polka';
import postgres from 'postgres';
import { container } from 'tsyringe';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

import { kSQL } from '../tokens';
import { discordOAuth2 } from '../util';

export default async (req: Request, _: Response, next?: NextHandler) => {
	if (req.headers.cookie) {
		const sql = container.resolve<postgres.Sql<any>>(kSQL);
		const cookies = cookie.parse(req.headers.cookie) as { token: string };

		let decoded: { provider: 'Discord' | 'Twitch'; access_token: string };
		try {
			decoded = jwt.verify(cookies.token, process.env.JWT_SECRET!) as {
				provider: 'Discord' | 'Twitch';
				access_token: string;
			};

			req.oauth = { provider: decoded.provider, token: cookies.token, access_token: decoded.access_token };
			return next?.();
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				const { provider, access_token } = jwt.decode(cookies.token) as {
					provider: 'Discord' | 'Twitch';
					access_token: string;
				};
				const [connection] = await sql<{ user_id: string; refresh_token: string }>`
					select user_id, refresh_token
					from connections
					where access_token = ${access_token}
						and provider = ${provider};`;

				const response = await discordOAuth2({ refreshToken: connection.refresh_token });
				await sql`
					update connections
					set access_token = ${response.access_token},
						refresh_token = ${response.refresh_token},
						expires_at = ${new Date(Date.now() + response.expires_in * 1000)}
					where access_token = ${access_token}
						and provider = ${provider};`;

				const token = jwt.sign(
					{
						provider: 'Discord',
						access_token: response.access_token,
						'https://hasura.io/jwt/claims': {
							'x-hasura-allowed-roles': ['user', 'mod', 'admin'],
							'x-hasura-default-role': 'user',
							'x-hasura-user-id': connection.user_id,
						},
					},
					process.env.JWT_SECRET!,
					{
						expiresIn: response.expires_in,
					},
				);
				req.oauth = { provider, token, access_token: response.access_token };
				return next?.();
			}

			return next?.(badRequest('Malformed or missing JWT'));
		}
	}

	return next?.(badRequest('Malformed or missing JWT'));
};
