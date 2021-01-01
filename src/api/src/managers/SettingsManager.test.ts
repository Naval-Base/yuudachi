import 'reflect-metadata';

import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';

import SettingsManager from './SettingsManager';

const { kSQL } = Tokens;

const mockedPostgres = { unsafe: jest.fn() };

container.register(kSQL, { useValue: mockedPostgres });

afterEach(() => {
	jest.clearAllMocks();
});

test('gets settings', async () => {
	mockedPostgres.unsafe.mockImplementation((): any => Promise.resolve([{ value: 'bar' }]));

	const manager = container.resolve(SettingsManager);
	const result = await manager.get('1234', 'foo');

	expect(result).toBe('bar');
	expect(mockedPostgres.unsafe).toHaveBeenCalledTimes(1);

	// TODO: Figure out whats wrong here
	/* expect(mockedPostgres.unsafe).toHaveBeenCalledWith(
		`select foo as value
			from
			where guild_id = $1`,
		['1234'],
	); */
});

test('gets missing setting', async () => {
	mockedPostgres.unsafe.mockImplementation((): any => Promise.resolve([]));

	const manager = container.resolve(SettingsManager);
	const result = await manager.get('1234', 'foo');

	expect(result).toBe(null);
	expect(mockedPostgres.unsafe).toHaveBeenCalledTimes(1);

	// TODO: Figure out whats wrong here
	/* expect(mockedPostgres.unsafe).toHaveBeenCalledWith(
		`select foo as value
			from
			where guild_id = $1`,
		['1234'],
	); */
});
