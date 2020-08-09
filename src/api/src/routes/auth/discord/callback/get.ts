import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Sql } from 'postgres';

import Route from '../../../../Route';
import { kSQL } from '../../../../tokens';
import { discordOAuth2 } from '../../../../util';
import session from '../../../../middleware/session';

interface DiscordUser {
	id: string;
	email: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

@injectable()
export default class DiscordLoginCallbackRoute extends Route {
	public middleware = [session];

	public constructor(
		@inject(kSQL)
		private readonly sql: Sql<any>,
	) {
		super();
	}

	public async handle(req: Request, res: Response, next: NextHandler) {
		if (!req.query) {
			return next('uh oh, something broke');
		}

		const response = await discordOAuth2({ code: req.query.code });
		const me: DiscordUser = await fetch('https://discordapp.com/api/users/@me', {
			headers: {
				authorization: `Bearer ${response.access_token}`,
			},
		}).then((r) => r.json());

		const [existingUser] = await this.sql<{
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
			where connections.id = ${me.id}
				and provider = 'Discord';
		`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (existingUser) {
			const token = jwt.sign(
				{
					sub: existingUser.user_id,
					'https://hasura.io/jwt/claims': {
						'x-hasura-allowed-roles': ['user', 'mod', 'admin'],
						'x-hasura-default-role': 'user',
						'x-hasura-user-id': existingUser.user_id,
					},
				},
				process.env.JWT_SECRET!,
				{
					expiresIn: Math.floor(Date.parse(existingUser.expires_at) - Date.now() / 1000),
				},
			);
			res.cookie('token', token, { httpOnly: true, path: '/', domain: process.env.COOKIE_DOMAIN! });
			res.redirect(process.env.DISCORD_REDIRECT!);
			return res.end(
				JSON.stringify({
					token,
					provider: 'Discord',
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

		const [user] = await this.sql<{ id: string; email: string; username: string }>`
			insert into users (email, username)
			values (${me.email}, ${me.username})
			returning id, email, username;
		`;
		const avatar = me.avatar
			? `http://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.${me.avatar.startsWith('a_') ? 'gif' : 'png'}`
			: `http://cdn.discordapp.com/embed/avatars/${Number(me.discriminator) % 5}.png`;
		await this.sql`
			insert into connections (
				id,
				user_id,
				provider,
				main,
				avatar,
				access_token,
				refresh_token,
				expires_at
			) values (
				${me.id},
				${user.id},
				'Discord',
				true,
				${avatar},
				${response.access_token},
				${response.refresh_token},
				${new Date(Date.now() + response.expires_in * 1000).toISOString()}
			);
		`;

		const token = jwt.sign(
			{
				sub: user.id,
				'https://hasura.io/jwt/claims': {
					'x-hasura-allowed-roles': ['user', 'mod', 'admin'],
					'x-hasura-default-role': 'user',
					'x-hasura-user-id': user.id,
				},
			},
			process.env.JWT_SECRET!,
			{
				expiresIn: response.expires_in,
			},
		);
		res.cookie('token', token, { httpOnly: true, path: '/', domain: process.env.COOKIE_DOMAIN! });
		res.redirect(process.env.DISCORD_REDIRECT!);
		res.end(
			JSON.stringify({
				token,
				provider: 'Discord',
				user: {
					id: me.id,
					user_id: user.id,
					avatar,
					email: user.email,
					username: user.username,
				},
			}),
		);
	}
}
