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

		const [user] = await this.sql<{ avatar: string; email: string; username: string }>`
			select id, avatar, email, username
			from users
			where id = ${req.oauth!.userId};
		`;

		const connections = await this.sql<{ }>`
			select * from connections where user_id = ${req.oauth!.userId};
		`;

		req.statusCode = 200;
		res.end(JSON.stringify({ user, connections }));
	}
}
