import 'reflect-metadata';

import Rest from '@yuudachi/rest';
import { Lockdown } from '@yuudachi/types';
import postgres, { Sql } from 'postgres';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import { OverwriteType, PermissionFlagsBits, Routes } from 'discord-api-types/v8';

import LockdownManager from './LockdownManager';
import SettingsManager, { SettingsKeys } from './SettingsManager';

const { kSQL } = Tokens;

jest.mock('@yuudachi/rest');
jest.mock('postgres', () => jest.fn(() => jest.fn()));
jest.mock('./SettingsManager');

const mockedRest: jest.Mocked<Rest> = new (Rest as any)();
const mockedPostgres: jest.MockedFunction<Sql<any>> = postgres() as any;
const mockedSettingsManager: jest.Mocked<SettingsManager> = new (SettingsManager as any)();

container.register(kSQL, { useValue: mockedPostgres });
container.register(Rest, { useValue: mockedRest });
container.register(SettingsManager, { useValue: mockedSettingsManager });

const modUsername = 'abc';
const modDiscriminator = '0001';

function generateSQLResult(lockdown: Lockdown) {
	return [
		[
			`
			insert into moderation.lockdowns (
				guild_id,
				channel_id,
				expiration,
				mod_id,
				mod_tag,
				reason,
				overwrites
			) values (
				`,
			`,
				`,
			`,
				`,
			`,
				`,
			`,
				`,
			`,
				`,
			`,
				`,
			`
			)
			returning mod_tag, overwrites`,
		],
		lockdown.guildId,
		lockdown.channelId,
		lockdown.expiration.toISOString(),
		lockdown.moderatorId,
		`${modUsername}#${modDiscriminator}`,
		lockdown.reason ?? null,
		[],
	];
}

let getCalls = 0;
mockedRest.get.mockImplementation(() => {
	switch (getCalls++) {
		case 0:
			return Promise.resolve({ username: modUsername, discriminator: modDiscriminator });
		case 1:
			return Promise.resolve({});
		default:
			return Promise.resolve(null);
	}
});

mockedPostgres.mockImplementation((): any =>
	Promise.resolve([{ mod_tag: `${modUsername}#${modDiscriminator}`, overwrites: [] }]),
);

// @ts-expect-error
mockedPostgres.json = jest.fn(() => []);

mockedSettingsManager.get.mockImplementation((_, prop) => {
	switch (prop) {
		case SettingsKeys.MOD_ROLE_ID:
			return Promise.resolve('foo');
	}

	throw new Error('unexpected prop');
});

afterEach(() => {
	getCalls = 0;
	jest.clearAllMocks();
});

describe('creates a lockdown', () => {
	test('with reason', async () => {
		const lockdown = {
			guildId: '3456',
			channelId: '4567',
			expiration: new Date(),
			moderatorId: '1234',
			reason: 'foo',
		};

		const manager = container.resolve(LockdownManager);
		const saved = await manager.create(lockdown);

		expect(saved.moderatorId).toBe('1234');
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(Routes.channelPermission('4567', '3456'), {
			allow: (0).toString(),
			deny: (PermissionFlagsBits.SEND_MESSAGES | PermissionFlagsBits.ADD_REACTIONS).toString(),
			type: OverwriteType.Role,
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(lockdown));
	});

	test('without reason', async () => {
		const lockdown = {
			guildId: '3456',
			channelId: '4567',
			expiration: new Date(),
			moderatorId: '1234',
		};

		const manager = container.resolve(LockdownManager);
		const saved = await manager.create(lockdown);

		expect(saved.moderatorId).toBe('1234');
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(Routes.channelPermission('4567', '3456'), {
			allow: (0).toString(),
			deny: (PermissionFlagsBits.SEND_MESSAGES | PermissionFlagsBits.ADD_REACTIONS).toString(),
			type: OverwriteType.Role,
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(lockdown));
	});
});

describe('lifts a lockdown', () => {
	test('without overwrites', async () => {
		const manager = container.resolve(LockdownManager);
		const deleted = await manager.delete('4567');

		expect(deleted).toBe('4567');
		expect(mockedRest.put).toHaveBeenCalledTimes(0);
		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			select overwrites
			from moderation.lockdowns
			where channel_id = `,
				'',
			],
			'4567',
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			delete
			from moderation.lockdowns
			where channel_id = `,
				'',
			],
			'4567',
		);
	});

	test('with overwrites', async () => {
		mockedPostgres.mockImplementation((): any =>
			Promise.resolve([
				{
					overwrites: [
						{
							allow: (0).toString(),
							deny: (0).toString(),
							type: OverwriteType.Role,
							id: '3456',
						},
					],
				},
			]),
		);

		const manager = container.resolve(LockdownManager);
		const deleted = await manager.delete('4567');

		expect(deleted).toBe('4567');
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(Routes.channelPermission('4567', '3456'), {
			allow: (0).toString(),
			deny: (0).toString(),
			type: OverwriteType.Role,
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			select overwrites
			from moderation.lockdowns
			where channel_id = `,
				'',
			],
			'4567',
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			delete
			from moderation.lockdowns
			where channel_id = `,
				'',
			],
			'4567',
		);
	});
});
