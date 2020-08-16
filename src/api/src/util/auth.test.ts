import { discordOAuth2 } from './auth';
import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

describe('oauth2', () => {
	const mockResponse = {
		access_token: 'test_token',
		token_type: 'test_type',
		expires_in: 123,
		refresh_token: 'test_refresh_token',
		scope: ['test', 'scope'],
	};

	test('proper form with code', async () => {
		((fetch as unknown) as jest.Mock).mockImplementation(() =>
			Promise.resolve(new Response(JSON.stringify(mockResponse))),
		);

		const res = await discordOAuth2({ code: 'test' });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(res).toStrictEqual(mockResponse);
	});

	test('proper form with refresh token', async () => {
		((fetch as unknown) as jest.Mock).mockImplementation(() =>
			Promise.resolve(new Response(JSON.stringify(mockResponse))),
		);

		const res = await discordOAuth2({ refreshToken: 'refresh_test' });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(res).toStrictEqual(mockResponse);
	});
});
