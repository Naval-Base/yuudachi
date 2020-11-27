import { Request, Response } from 'polka';
import { injectable, inject } from 'tsyringe';
import { URLSearchParams } from 'url';

import Route from '../../../Route';
import { State } from '../../../util/auth';
import session from '../../../middleware/session';
import Config from '../../../Config';
import { kConfig } from '../../../tokens';

@injectable()
export default class DiscordLoginRoute extends Route {
	public middleware = [session];

	public constructor(@inject(kConfig) private readonly config: Config) {
		super();
	}

	public handle(req: Request, res: Response) {
		const state = new State(req.headers.referer).toString();

		const params = new URLSearchParams({
			client_id: this.config.discordClientId,
			redirect_uri: `${this.config.publicApiDomain}/api/auth/discord/callback`,
			response_type: 'code',
			scope: this.config.discordScopes.join(' '),
			state,
		});

		res.cookie('state', state, { httpOnly: true });
		res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
		res.end();
	}
}
