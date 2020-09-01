import 'reflect-metadata';

import { container } from 'tsyringe';
import { discordOAuth2, State } from './auth';
import fetch from 'node-fetch';
import { Config } from '../Config';
import { kConfig } from '../tokens';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');
const mockFetch = (fetch as unknown) as jest.Mock;

container.register<Config>(kConfig, {
	useValue: {
		discordClientId: '',
		discordClientSecret: '',
		discordScopes: [],
		publicApiDomain: '',
		publicFrontendDomain: 'https://foo.bar',
		secretKey: '',
	},
});

const NOW = new Date();

const nonce = Buffer.from(Array(16).fill(1));
const time = Buffer.alloc(4);
time.writeUInt32LE(Math.floor(NOW.getTime() / 1000));

jest.mock('crypto', () => {
	const original = jest.requireActual('crypto');
	return {
		...original,
		randomBytes: (len: number) => Buffer.from(Array(len).fill(1)),
	};
});

global.Date = jest.fn().mockReturnValue(NOW) as any;

afterEach(() => {
	mockFetch.mockRestore();
});

describe('oauth2', () => {
	const mockResponse = {
		access_token: 'test_token',
		token_type: 'test_type',
		expires_in: 123,
		refresh_token: 'test_refresh_token',
		scope: ['test', 'scope'],
	};

	test('proper form with code', async () => {
		mockFetch.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(mockResponse))));

		const res = await discordOAuth2({ code: 'test' });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(res).toStrictEqual(mockResponse);
	});

	test('proper form with refresh token', async () => {
		mockFetch.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(mockResponse))));

		const res = await discordOAuth2({ refreshToken: 'refresh_test' });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(res).toStrictEqual(mockResponse);
	});
});

describe('state', () => {
	test('default redirect URI', () => {
		const state = new State();
		expect(state.redirectUri).toBe('https://foo.bar');
	});

	test('specific redirect URL', () => {
		const state = new State('https://foo.bar/baz');
		expect(state.redirectUri).toBe('https://foo.bar/baz');
	});

	test('creates buffer', () => {
		const state = new State();
		expect(state.toBytes()).toStrictEqual(Buffer.concat([nonce, time, Buffer.from('https://foo.bar')]));
	});

	test('creates from base 64', () => {
		const state = State.from('AQEBAQEBAQEBAQEBAQEBAdmhTV9odHRwczovL2Zvby5iYXIvYmF6');
		expect(state.redirectUri).toBe('https://foo.bar/baz');
	});

	test('converts to base 64', () => {
		const state = new State('https://foo.bar/baz');
		expect(state.toString()).toBe(Buffer.concat([nonce, time, Buffer.from('https://foo.bar/baz')]).toString('base64'));
	});
});
