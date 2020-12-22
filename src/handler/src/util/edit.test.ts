import 'reflect-metadata';

import Rest from '@yuudachi/rest';
import { container } from 'tsyringe';
import { edit } from './edit';
import { Routes } from 'discord-api-types';

jest.mock('@yuudachi/rest');

const mockedRest: jest.Mocked<Rest> = new (Rest as any)();

container.register(Rest, { useValue: mockedRest });

process.env.DISCORD_CLIENT_ID = '1234';

afterEach(() => {
	jest.clearAllMocks();
});

describe('edit interaction', () => {
	test('with embed', async () => {
		await edit({ id: '1234', token: 'test' } as any, { content: 'test', embed: {} });

		expect(mockedRest.patch).toHaveBeenCalledTimes(1);
		expect(mockedRest.patch).toHaveBeenCalledWith(Routes.webhookMessage('1234', 'test'), {
			type: 4,
			data: {
				content: 'test',
				embeds: [{}],
			},
		});
	});

	test('without embed', async () => {
		await edit({ id: '1234', token: 'test' } as any, { content: 'test' });

		expect(mockedRest.patch).toHaveBeenCalledTimes(1);
		expect(mockedRest.patch).toHaveBeenCalledWith(Routes.webhookMessage('1234', 'test'), {
			type: 4,
			data: {
				content: 'test',
			},
		});
	});
});

test('edit normal', () => {
	void edit({ id: '1234', channel_id: '1234' } as any, { content: 'test' });

	expect(mockedRest.patch).toHaveBeenCalledTimes(1);
	expect(mockedRest.patch).toHaveBeenCalledWith(Routes.channelMessage('1234', '1234'), {
		content: 'test',
	});
});
