import { Boom } from '@hapi/boom';
import { Response } from 'polka';
import fetch from 'node-fetch';
import FormData from 'form-data';

export interface OAuth2Response {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string[];
}

export function sendBoom(err: Boom, res: Response) {
	res.statusCode = err.output.statusCode;
	for (const [header, value] of Object.entries(err.output.headers)) {
		res.setHeader(header, value);
	}

	res.end(JSON.stringify(err.output.payload));
}

export async function oauth2({
	clientId,
	clientSecret,
	redirectUri,
	scope,
	code,
	refreshToken,
	url,
}: {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	scope: string;
	code?: string;
	refreshToken?: string;
	url: string;
}): Promise<OAuth2Response> {
	const form = new FormData();
	form.append('client_id', clientId);
	form.append('client_secret', clientSecret);
	form.append('redirect_uri', redirectUri);
	form.append('scope', scope);
	/* istanbul ignore else */
	// https://github.com/gotwarlost/istanbul/issues/781
	if (code) {
		form.append('grant_type', 'authorization_code');
		form.append('code', code);
	} else if (refreshToken) {
		form.append('grant_type', 'refresh_token');
		form.append('refresh_token', refreshToken);
	}

	return fetch(url, {
		method: 'POST',
		body: form,
	}).then((r) => r.json());
}

export async function discordOAuth2({ code, refreshToken }: { code?: string; refreshToken?: string }) {
	return oauth2({
		clientId: process.env.DISCORD_CLIENT_ID!,
		clientSecret: process.env.DISCORD_CLIENT_SECRET!,
		redirectUri: `${process.env.DISCORD_CALLBACK_DOMAIN!}${process.env.DISCORD_CALLBACK_PORT!}/api${process.env
			.DISCORD_CALLBACK_ROUTE!}`,
		scope: process.env.DISCORD_SCOPES!.split(',').join(' '),
		code,
		refreshToken,
		url: 'https://discord.com/api/oauth2/token',
	});
}
