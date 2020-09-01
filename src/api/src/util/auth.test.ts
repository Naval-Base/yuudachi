import 'reflect-metadata';

import { container } from 'tsyringe';
import { discordOAuth2 } from './auth';
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
		publicFrontendDomain: '',
		secretKey: '',
	},
});

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
