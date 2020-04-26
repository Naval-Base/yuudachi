import 'reflect-metadata';

import { container } from 'tsyringe';
import postgres, { SQL } from 'postgres';
import { kSQL } from '../tokens';
import SettingsManager from './SettingsManager';

jest.mock('postgres', () => jest.fn(() => jest.fn()));

const mockedPostgres: jest.MockedFunction<SQL> = postgres() as any;

container.register(kSQL, { useValue: mockedPostgres });

test('gets settings', async () => {
	mockedPostgres.mockResolvedValue([{ value: 'bar' }]);

	const manager = container.resolve(SettingsManager);
	const result = await manager.get('1234', 'foo');

	expect(result).toBe('bar');
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith([`
			select value
			from guild_settings
			where guild_id = `,`
				and key = `,''], '1234', 'foo');
});

test('gets missing setting', async () => {
	mockedPostgres.mockResolvedValue([]);

	const manager = container.resolve(SettingsManager);
	const result = await manager.get('1234', 'foo');

	expect(result).toBe(null);
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith([`
			select value
			from guild_settings
			where guild_id = `,`
				and key = `,''], '1234', 'foo');
});
