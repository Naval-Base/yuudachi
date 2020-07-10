import 'reflect-metadata';

import { container } from 'tsyringe';
import postgres, { Sql } from 'postgres';
import { kSQL } from '../tokens';
import SettingsManager from './SettingsManager';

jest.mock('postgres', () => jest.fn(() => jest.fn()));

const mockedPostgres: jest.MockedFunction<Sql<any>> = postgres() as any;

container.register(kSQL, { useValue: mockedPostgres });

afterEach(() => {
	jest.clearAllMocks();
});

test('gets settings', async () => {
	mockedPostgres.mockImplementation((): any => Promise.resolve([{ value: 'bar' }]));

	const manager = container.resolve(SettingsManager);
	const result = await manager.get('1234', 'foo');

	expect(result).toBe('bar');
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(
		[
			`
			select settings ->> `,
			` as value
			from settings
			where guild_id = `,
			`;`,
		],
		'foo',
		'1234',
	);
});

test('gets missing setting', async () => {
	mockedPostgres.mockImplementation((): any => Promise.resolve([]));

	const manager = container.resolve(SettingsManager);
	const result = await manager.get('1234', 'foo');

	expect(result).toBe(null);
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(
		[
			`
			select settings ->> `,
			` as value
			from settings
			where guild_id = `,
			`;`,
		],
		'foo',
		'1234',
	);
});
