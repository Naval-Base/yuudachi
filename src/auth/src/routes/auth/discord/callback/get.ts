import cookie from 'cookie';
import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import fetch from 'node-fetch';
import { Sql } from 'postgres';
import { badRequest } from '@hapi/boom';
import { Route, discordOAuth2, State } from '@yuudachi/http';
import { AuthManager, session, Tokens } from '@yuudachi/core';

const { kSQL } = Tokens;

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
		private readonly authManager: AuthManager,
	) {
		super();
	}

	public async handle(req: Request, res: Response, next: NextHandler) {
		if (!req.query) {
			return next(badRequest('missing oauth response data'));
		}

		const cookies = cookie.parse(req.headers.cookie ?? '');
		if (req.query.state !== cookies.state) return next(badRequest('invalid state'));

		const state = State.from(req.query.state);
		// maybe expire the state here

		const response = await discordOAuth2({ code: req.query.code });
		const me: DiscordUser = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `Bearer ${response.access_token}`,
			},
		}).then((r) => r.json());

		let [user] = await this.sql<{ id: string }>`
			select users.id
			from users
			join connections
			on connections.user_id = users.id
			where connections.id = ${me.id}`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (user) {
			await this.sql`
				update connections
				set
					access_token = ${response.access_token},
					refresh_token = ${response.refresh_token},
					expires_at = ${new Date(Date.now() + response.expires_in * 1000).toISOString()}
				where id = ${me.id}`;
		} else {
			[user] = await this.sql<{ id: string }>`
				insert into users (email, username)
				values (${me.email}, ${me.username})
				returning id;
			`;
			const avatar = me.avatar
				? `http://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.${me.avatar.startsWith('a_') ? 'gif' : 'png'}`
				: `http://cdn.discordapp.com/embed/avatars/${Number(me.discriminator) % 5}.png`;
			await this.sql`
				insert into connections (
					id,
					user_id,
					avatar,
					access_token,
					refresh_token,
					expires_at
				) values (
					${me.id},
					${user.id},
					${avatar},
					${response.access_token},
					${response.refresh_token},
					${new Date(Date.now() + response.expires_in * 1000).toISOString()}
				);
			`;
		}

		const credentials = await this.authManager.create(user.id);
		AuthManager.respondWith(credentials, res);
		res.redirect(state.redirectUri);
		res.end();
	}
}
