import 'reflect-metadata';

import Rest from '@yuudachi/rest';
import { Case, CaseAction } from '@yuudachi/types';
import postgres, { Sql } from 'postgres';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import { Routes, Snowflake } from 'discord-api-types/v8';

import CaseManager from './CaseManager';

const { kSQL } = Tokens;

jest.mock('@yuudachi/rest');
jest.mock('postgres', () => jest.fn(() => jest.fn()));

const mockedRest: jest.Mocked<Rest> = new (Rest as any)();
const mockedPostgres: jest.MockedFunction<Sql<any>> = postgres() as any;

container.register(kSQL, { useValue: mockedPostgres });
container.register(Rest, { useValue: mockedRest });

const modUsername = 'abc';
const modDiscriminator = '0001';
const targetUsername = 'def';
const targetDiscriminator = '0002';

function generateSQLResult(case_: Case) {
	return [
		[
			`
			insert into cases (
				case_id,
				guild_id,
				mod_id,
				mod_tag,
				target_id,
				target_tag,
				action,
				role_id,
				action_expiration,
				action_processed,
				reason,
				context_message_id,
				ref_id
			) values (
				next_case(`,
			`),
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
			returning case_id`,
		],
		case_.guildId,
		case_.guildId,
		case_.moderatorId,
		`${modUsername}#${modDiscriminator}`,
		case_.targetId,
		`${targetUsername}#${targetDiscriminator}`,
		case_.action,
		case_.roleId ?? null,
		case_.actionExpiration?.toISOString() ?? null,
		case_.actionExpiration ? false : true,
		case_.reason ?? null,
		case_.contextMessageId ?? null,
		case_.referenceId ?? null,
	];
}

let getCalls = 0;
mockedRest.get.mockImplementation(() => {
	switch (getCalls++) {
		case 0:
			return Promise.resolve({ username: targetUsername, discriminator: targetDiscriminator });
		case 1:
			return Promise.resolve({ username: modUsername, discriminator: modDiscriminator });
		default:
			return Promise.resolve(null);
	}
});

mockedPostgres.mockImplementation((): any => Promise.resolve([{ case_id: 1 }]));

afterEach(() => {
	getCalls = 0;
	jest.clearAllMocks();
});

describe('create', () => {
	test('without a reason', async () => {
		const case_: Case = {
			action: CaseAction.SOFTBAN,
			caseId: 0,
			guildId: '1234',
			moderatorId: '2345',
			targetId: '3456',
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(Routes.guildBan('1234', '3456'), {
			delete_message_days: 1,
			reason: 'Mod: abc#0001',
		});
		expect(mockedRest.delete).toHaveBeenCalledTimes(1);
		expect(mockedRest.delete).toHaveBeenCalledWith('/guilds/1234/bans/3456', { reason: 'Mod: abc#0001' });
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});

	test('role case', async () => {
		const case_ = {
			action: CaseAction.ROLE,
			caseId: 0,
			guildId: '1234' as Snowflake,
			moderatorId: '2345' as Snowflake,
			reason: 'foo',
			targetId: '3456' as Snowflake,
			roleId: '4567' as Snowflake,
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(
			Routes.guildMemberRole('1234', '3456', '4567'),
			{},
			{ reason: 'Mod: abc#0001 | foo' },
		);
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});

	test('warn case with reference', async () => {
		const case_: Case = {
			action: CaseAction.WARN,
			caseId: 0,
			guildId: '1234',
			moderatorId: '2345',
			reason: 'foo',
			targetId: '3456',
			referenceId: 2,
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});

	test('kick case with context', async () => {
		const case_: Case = {
			action: CaseAction.KICK,
			caseId: 0,
			guildId: '1234',
			moderatorId: '2345',
			reason: 'foo',
			targetId: '3456',
			contextMessageId: '4567',
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedRest.delete).toHaveBeenCalledTimes(1);
		expect(mockedRest.delete).toHaveBeenCalledWith(Routes.guildMember('1234', '3456'), {
			reason: 'Mod: abc#0001 | foo',
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});

	test('softban with delete message days', async () => {
		const case_: Case = {
			action: CaseAction.SOFTBAN,
			caseId: 0,
			guildId: '1234',
			moderatorId: '2345',
			reason: 'foo',
			targetId: '3456',
			deleteMessageDays: 3,
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(Routes.guildBan('1234', '3456'), {
			delete_message_days: 3,
			reason: 'Mod: abc#0001 | foo',
		});
		expect(mockedRest.delete).toHaveBeenCalledTimes(1);
		expect(mockedRest.delete).toHaveBeenCalledWith('/guilds/1234/bans/3456', { reason: 'Mod: abc#0001 | foo' });
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});

	test('ban with expiration & default delete message days', async () => {
		const case_: Case = {
			action: CaseAction.BAN,
			caseId: 0,
			guildId: '1234',
			moderatorId: '2345',
			reason: 'foo',
			targetId: '3456',
			contextMessageId: '4567',
			actionExpiration: new Date(),
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedRest.put).toHaveBeenCalledTimes(1);
		expect(mockedRest.put).toHaveBeenCalledWith(Routes.guildBan('1234', '3456'), {
			delete_message_days: 0,
			reason: 'Mod: abc#0001 | foo',
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});

	test('unban case', async () => {
		const case_: Case = {
			action: CaseAction.UNBAN,
			caseId: 0,
			guildId: '1234',
			moderatorId: '2345',
			reason: 'foo',
			targetId: '3456',
			contextMessageId: '4567',
		};

		const manager = container.resolve(CaseManager);
		const saved = await manager.create(case_);

		expect(saved).toBe(case_);
		expect(saved.caseId).toBe(1);
		expect(mockedRest.delete).toHaveBeenCalledTimes(1);
		expect(mockedRest.delete).toHaveBeenCalledWith(Routes.guildBan('1234', '3456'), { reason: 'Mod: abc#0001 | foo' });
		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
	});
});

describe('update ', () => {
	test('expiration of a case', async () => {
		const case_ = {
			caseId: 0,
			guildId: '1234' as Snowflake,
			actionExpiration: new Date(),
		};

		mockedPostgres.mockImplementation((): any => Promise.resolve([case_]));

		const manager = container.resolve(CaseManager);
		await manager.update(case_);

		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
				update cases
				set action_expiration = `,
				`
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			case_.actionExpiration.toISOString(),
			'1234',
			0,
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			select *
			from cases
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);
	});

	test('reason of a case', async () => {
		const case_ = {
			caseId: 0,
			guildId: '1234' as Snowflake,
			reason: 'foo',
		};

		mockedPostgres.mockImplementation((): any => Promise.resolve([case_]));

		const manager = container.resolve(CaseManager);
		await manager.update(case_);

		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
				update cases
				set reason = `,
				`
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			case_.reason,
			'1234',
			0,
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			select *
			from cases
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);
	});

	test('context of a case', async () => {
		const case_ = {
			caseId: 0,
			guildId: '1234' as Snowflake,
			contextMessageId: '4567' as Snowflake,
		};

		mockedPostgres.mockImplementation((): any => Promise.resolve([case_]));

		const manager = container.resolve(CaseManager);
		await manager.update(case_);

		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
				update cases
				set context_message_id = `,
				`
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			case_.contextMessageId,
			'1234',
			0,
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			select *
			from cases
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);
	});

	test('reference of a case', async () => {
		const case_ = {
			caseId: 0,
			guildId: '1234' as Snowflake,
			referenceId: 1,
		};

		mockedPostgres.mockImplementation((): any => Promise.resolve([case_]));

		const manager = container.resolve(CaseManager);
		await manager.update(case_);

		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
				update cases
				set ref_id = `,
				`
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			case_.referenceId,
			'1234',
			0,
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			select *
			from cases
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);
	});
});

describe('soft delete', () => {
	test('timed ban', async () => {
		const case_ = {
			action: CaseAction.BAN,
			case_id: 0,
			guild_id: '1234' as Snowflake,
			mod_id: '2345' as Snowflake,
			reason: 'foo',
			target_id: '3456' as Snowflake,
			context_message_id: '4567' as Snowflake,
		};

		mockedPostgres.mockImplementation((): any => Promise.resolve([case_]));

		const manager = container.resolve(CaseManager);
		await manager.delete(case_.guild_id, case_.case_id);

		expect(mockedRest.delete).toHaveBeenCalledTimes(1);
		expect(mockedRest.delete).toHaveBeenCalledWith(Routes.guildBan('1234', '3456'), {
			reason: 'Mod: abc#0001 | Automatic unban based on duraton',
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(3);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			update cases
			set action_processed = true
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			update cases
			set action_processed = true
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);

		// TODO: Figure out whats wrong here
		/* expect(mockedPostgres).toHaveBeenCalledWith(
			...generateSQLResult({
				action: CaseAction.UNBAN,
				caseId: case_.case_id,
				guildId: case_.guild_id,
				moderatorId: case_.mod_id,
				reason: case_.reason,
				targetId: case_.target_id,
				contextMessageId: case_.context_message_id,
				roleId: case_.role_id,
			} as any),
		); */
	});

	test('timed role', async () => {
		const case_ = {
			action: CaseAction.ROLE,
			case_id: 0,
			guild_id: '1234' as Snowflake,
			mod_id: '2345' as Snowflake,
			reason: 'foo',
			target_id: '3456' as Snowflake,
			context_message_id: '4567' as Snowflake,
			role_id: '5678' as Snowflake,
		};

		mockedPostgres.mockImplementation((): any => Promise.resolve([case_]));

		const manager = container.resolve(CaseManager);
		await manager.delete(case_.guild_id, case_.case_id);

		expect(mockedRest.delete).toHaveBeenCalledTimes(1);
		expect(mockedRest.delete).toHaveBeenCalledWith(Routes.guildMemberRole('1234', '3456', '5678'), {
			reason: 'Mod: abc#0001 | Automatic unrole based on duration',
		});
		expect(mockedPostgres).toHaveBeenCalledTimes(3);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			update cases
			set action_processed = true
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);
		expect(mockedPostgres).toHaveBeenCalledWith(
			[
				`
			update cases
			set action_processed = true
			where guild_id = `,
				`
				and case_id = `,
				'',
			],
			'1234',
			0,
		);

		// TODO: Figure out whats wrong here
		/* expect(mockedPostgres).toHaveBeenCalledWith(
			...generateSQLResult({
				action: CaseAction.UNBAN,
				caseId: case_.case_id,
				guildId: case_.guild_id,
				moderatorId: case_.mod_id,
				reason: case_.reason,
				targetId: case_.target_id,
				contextMessageId: case_.context_message_id,
				roleId: case_.role_id,
			} as any),
		); */
	});
});
