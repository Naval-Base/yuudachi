import cookie from 'cookie';
import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import fetch from 'node-fetch';
import { Sql } from 'postgres';

import Route from '../../../../Route';
import { kSQL } from '../../../../tokens';
import { discordOAuth2 } from '../../../../util/auth';
import session from '../../../../middleware/session';
import AuthManager from '../../../../managers/AuthManager';
import { badRequest } from '@hapi/boom';

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
			return next('uh oh, something broke');
		}

		const cookies = cookie.parse(req.headers.cookie ?? '');
		if (req.query.state !== cookies.state) return next(badRequest('invalid state'));

		const response = await discordOAuth2({ code: req.query.code });
		const me: DiscordUser = await fetch('https://discordapp.com/api/users/@me', {
			headers: {
				authorization: `Bearer ${response.access_token}`,
			},
		}).then((r) => r.json());

		let [user] = await this.sql<{ id: string }>`
			select users.id
			from users
			join connections
			on connections.user_id = users.id
			where connections.id = ${me.id}
				and provider = 'Discord';
		`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (user) {
			await this.sql`
				update connections
				set
					access_token = ${response.access_token},
					refresh_token = ${response.refresh_token},
					expires_at = ${new Date(Date.now() + response.expires_in * 1000).toISOString()}
				where id = ${me.id} and provider = 'Discord'
			`;
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
		}

		const credentials = await this.authManager.create(user.id);
		AuthManager.respondWith(credentials, res);
		res.redirect(process.env.DISCORD_REDIRECT!);
		res.end();
	}
}
