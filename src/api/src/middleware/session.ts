import { Request, Response, NextHandler } from 'polka';
import postgres from 'postgres';
import { container } from 'tsyringe';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

import { kSQL } from '../tokens';

export default async (req: Request, res: Response, next?: NextHandler) => {
	if (req.headers.cookie) {
		const sql = container.resolve<postgres.Sql<any>>(kSQL);
		const cookies = cookie.parse(req.headers.cookie) as { token: string };

		let decoded: { provider: 'Discord' | 'Twitch'; access_token: string };
		try {
			decoded = jwt.verify(cookies.token, process.env.JWT_SECRET!) as {
				provider: 'Discord' | 'Twitch';
				access_token: string;
			};

			const [existingUser] = await sql<{
				id: string;
				user_id: string;
				avatar: string;
				email: string;
				username: string;
				expires_at: string;
			}>`
				select connections.id, user_id, avatar, email, username, expires_at
				from connections
				join users
				on connections.user_id = users.id
				where access_token = ${decoded.access_token}
					and provider = ${decoded.provider};
			`;
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (existingUser) {
				res.redirect(process.env.SESSION_REDIRECT!);
				return res.end(
					JSON.stringify({
						token: cookies.token,
						provider: decoded.provider,
						user: {
							id: existingUser.id,
							user_id: existingUser.user_id,
							avatar: existingUser.avatar,
							email: existingUser.email,
							username: existingUser.username,
						},
					}),
				);
			}
		} catch {}
	}

	next?.();
};
