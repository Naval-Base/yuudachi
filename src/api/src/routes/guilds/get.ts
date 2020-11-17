import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import fetch from 'node-fetch';
import { Sql } from 'postgres';

import Route from '../../Route';
import { kSQL } from '../../tokens';
import { authenticate } from '../../middleware';

@injectable()
export default class GetGuildsRoute extends Route {
	public middleware = [authenticate()];

	public constructor(
		@inject(kSQL)
		private readonly sql: Sql<any>,
	) {
		super();
	}

	public async handle(req: Request, res: Response, next: NextHandler) {
		if (!req.headers.cookie) {
			return next('uh oh, something broke');
		}

		const [connection] = await this.sql<{ access_token: string }>`
			select access_token
			from connections
			where user_id = ${req.auth!.userId} and provider = 'discord'
		`;
		const guilds = await fetch('https://discord.com/api/users/@me/guilds', {
			headers: {
				authorization: `Bearer ${connection.access_token}`,
			},
		}).then((r) => r.json());

		req.statusCode = 200;
		res.end(JSON.stringify({ guilds }));
	}
}
