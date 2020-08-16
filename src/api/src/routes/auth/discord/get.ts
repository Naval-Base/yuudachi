import { Request, Response } from 'polka';
import { injectable } from 'tsyringe';
import { URLSearchParams } from 'url';

import Route from '../../../Route';
import { State } from '../../../util/auth';
import session from '../../../middleware/session';

@injectable()
export default class DiscordLoginRoute extends Route {
	public middleware = [session];

	public handle(req: Request, res: Response) {
		const state = new State(req.headers.referer).toString();

		const params = new URLSearchParams({
			client_id: process.env.DISCORD_CLIENT_ID!,
			redirect_uri: `${process.env.DISCORD_CALLBACK_DOMAIN!}${process.env.DISCORD_CALLBACK_PORT!}/api${process.env
				.DISCORD_CALLBACK_ROUTE!}`,
			response_type: 'code',
			scope: process.env.DISCORD_SCOPES!.split(',').join(' '),
			state,
		});

		res.cookie('state', state, { httpOnly: true });
		res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
		res.end();
	}
}
