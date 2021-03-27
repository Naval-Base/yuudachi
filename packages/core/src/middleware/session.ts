import { Request, Response, NextHandler } from 'polka';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Config } from '@yuudachi/types';

import { kSQL, kConfig } from '../tokens';

export default async (req: Request, res: Response, next?: NextHandler) => {
	if (req.headers.cookie) {
		const sql = container.resolve<Sql<any>>(kSQL);
		const cookies = cookie.parse(req.headers.cookie) as { token: string };

		let decoded: { access_token: string };
		try {
			const config = container.resolve<Config>(kConfig);
			decoded = jwt.verify(cookies.token, config.secretKey) as {
				access_token: string;
			};

			const [existingUser] = await sql<
				[
					{
						id: string;
						user_id: string;
						avatar: string;
						email: string;
						username: string;
						expires_at: string;
					}?,
				]
			>`
				select connections.id, user_id, avatar, email, username, expires_at
				from connections
				join users
				on connections.user_id = users.id
				where access_token = ${decoded.access_token};
			`;

			if (existingUser) {
				res.redirect(config.publicFrontendDomain);
				return res.end(
					JSON.stringify({
						token: cookies.token,
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
