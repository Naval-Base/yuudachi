import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import { Sql } from 'postgres';

import Route from '../../../Route';
import { authenticate } from '../../../middleware';
import { kSQL } from '../../../tokens';

@injectable()
export default class DiscordLoginRoute extends Route {
	public middleware = [authenticate];

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

		const [user] = await this.sql<{ id: string; user_id: string; avatar: string; email: string; username: string }>`
			select connections.id, user_id, avatar, email, username
			from connections
			join users
			on connections.user_id = users.id
			where access_token = ${req.oauth!.access_token}
			and provider = ${req.oauth!.provider};
		`;

		req.statusCode = 200;
		res.end(JSON.stringify({ token: req.oauth!.token, provider: req.oauth!.provider, user }));
	}
}
