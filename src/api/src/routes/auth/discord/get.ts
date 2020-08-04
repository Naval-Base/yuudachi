import { Request, Response } from 'polka';
import { injectable } from 'tsyringe';
import { URLSearchParams } from 'url';

import Route from '../../../Route';
import session from '../../../middleware/session';

@injectable()
export default class DiscordLoginRoute extends Route {
	public middleware = [session];

	public handle(_: Request, res: Response) {
		const params = new URLSearchParams({
			client_id: process.env.DISCORD_CLIENT_ID!,
			redirect_uri: `${process.env.DISCORD_CALLBACK_DOMAIN!}${process.env.DISCORD_CALLBACK_PORT!}${process.env
				.DISCORD_CALLBACK_ROUTE!}`,
			response_type: 'code',
			scope: process.env.DISCORD_SCOPES!.split(',').join(' '),
		});

		res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
		res.end();
	}
}
