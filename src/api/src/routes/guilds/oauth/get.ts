import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import { Sql } from 'postgres';
import fetch from 'node-fetch';
import { Route } from '@yuudachi/http';
import { Constants, Tokens } from '@yuudachi/core';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v8';
import { unauthorized } from '@hapi/boom';

const { kSQL } = Tokens;
const { USER_ID_HEADER } = Constants;

@injectable()
export default class GetOAuthGuildsRoute extends Route {
	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {
		super();
	}

	public async handle(req: Request, res: Response, next: NextHandler) {
		const userId = req.headers[USER_ID_HEADER];
		if (!userId) {
			return next(unauthorized());
		}

		const [connection] = await this.sql<{ access_token: string }>`
			select access_token
			from connections
			where user_id = ${userId}`;
		const guilds: RESTGetAPICurrentUserGuildsResult = await fetch('https://discord.com/api/users/@me/guilds', {
			headers: {
				authorization: `Bearer ${connection.access_token}`,
			},
		}).then((r) => r.json());

		req.statusCode = 200;
		res.setHeader('content-type', 'application/json; charset=utf-8');
		res.end(JSON.stringify(guilds));
	}
}
