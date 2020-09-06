import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { container } from 'tsyringe';

import Config from '../Config';
import { kConfig } from '../tokens';

export interface OAuth2Response {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string[];
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
	const config = container.resolve<Config>(kConfig);
	return oauth2({
		clientId: config.discordClientId,
		clientSecret: config.discordClientSecret,
		redirectUri: `${config.publicApiDomain}/api/auth/discord/callback`,
		scope: config.discordScopes.join(' '),
		code,
		refreshToken,
		url: 'https://discord.com/api/oauth2/token',
	});
}

export class State {
	public static from(data: string): State {
		const bytes = Buffer.from(data, 'base64');
		const nonce = bytes.slice(0, 16);
		const createdAt = new Date(bytes.readUInt32LE(16));
		const redirectURL = bytes.slice(20).toString();

		const state = new this(redirectURL);
		state.nonce = nonce;
		state.createdAt = createdAt;

		return state;
	}

	public redirectUri: string;
	private nonce: Buffer = randomBytes(16);
	private createdAt: Date = new Date();

	public constructor(redirectURL?: string) {
		this.redirectUri = redirectURL ?? container.resolve<Config>(kConfig).publicFrontendDomain;
	}

	public toString(): string {
		return this.toBytes().toString('base64');
	}

	public toBytes(): Buffer {
		const time = Buffer.allocUnsafe(4);
		time.writeUInt32LE(Math.floor(this.createdAt.getTime() / 1000));
		return Buffer.concat([this.nonce, time, Buffer.from(this.redirectUri)]);
	}
}
