import 'reflect-metadata';

import Rest from '@yuudachi/rest';
import { container } from 'tsyringe';
import { send } from './send';
import { Routes } from 'discord-api-types';

jest.mock('@yuudachi/rest');

const mockedRest: jest.Mocked<Rest> = new (Rest as any)();

container.register(Rest, { useValue: mockedRest });

afterEach(() => {
	jest.clearAllMocks();
});

describe('send interaction', () => {
	test('with embed', async () => {
		await send({ id: '1234', token: 'test' } as any, { content: 'test', embed: {} });

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(Routes.interactionCallback('1234', 'test'), {
			type: 4,
			data: {
				content: 'test',
				embeds: [{}],
			},
		});
	});

	test('without embed', async () => {
		await send({ id: '1234', token: 'test' } as any, { content: 'test' });

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(Routes.interactionCallback('1234', 'test'), {
			type: 4,
			data: {
				content: 'test',
			},
		});
	});
});

test('send normal', () => {
	void send({ channel_id: '1234' } as any, { content: 'test' });

	expect(mockedRest.post).toHaveBeenCalledTimes(1);
	expect(mockedRest.post).toHaveBeenCalledWith(Routes.channelMessages('1234'), {
		content: 'test',
	});
});
