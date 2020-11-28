import Joi from 'joi';
import { Request, Response, NextHandler } from 'polka';
import { inject, injectable } from 'tsyringe';
import fetch from 'node-fetch';
import { Sql } from 'postgres';
import { Route } from '@yuudachi/http';
import { Constants, Tokens } from '@yuudachi/core';

import { validate, bodyParser } from '../../../../middleware';

const { kSQL } = Tokens;
const { USER_ID_HEADER } = Constants;

enum Actions {
	OAUTH_GUILDS = 'oauth_guilds',
}

interface OAuthGuildsActionPayload {
	action: {
		name: Actions.OAUTH_GUILDS;
	};
	input: unknown;
	session_variables: Record<string, string>;
}

@injectable()
export default class HasuraOAuthGuildsActionHandler extends Route {
	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {
		super();
	}

	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					action: Joi.object()
						.keys({
							name: Joi.string().valid(Actions.OAUTH_GUILDS).required(),
						})
						.required(),
					input: Joi.object().required(),
					session_variables: Joi.object().required(),
				})
				.required(),
		),
	];

	public async handle(req: Request, res: Response, next: NextHandler) {
		if (!req.body) {
			return next('uh oh, something broke');
		}

		const body: OAuthGuildsActionPayload = req.body as any;
		const userId = body.session_variables[USER_ID_HEADER];

		const [connection] = await this.sql<{ access_token: string }>`
			select access_token
			from connections
			where user_id = ${userId} and provider = 'discord'
		`;
		const guilds = await fetch('https://discord.com/api/users/@me/guilds', {
			headers: {
				authorization: `Bearer ${connection.access_token}`,
			},
		}).then((r) => r.json());

		req.statusCode = 200;
		res.end(JSON.stringify(guilds));
	}
}
