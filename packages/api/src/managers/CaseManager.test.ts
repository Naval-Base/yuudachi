import 'reflect-metadata';

import Rest from '@spectacles/rest';
import postgres, { Sql } from 'postgres';
import { container } from 'tsyringe';
import CaseManager, { CaseAction, Case } from './CaseManager';
import { kSQL } from '../tokens';

jest.mock('@spectacles/rest');
jest.mock('postgres', () => jest.fn(() => jest.fn()));

const mockedRest: jest.Mocked<Rest> = new Rest() as any;
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
		case_.actionExpiration ?? null,
		case_.reason,
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

test('creates role case', async () => {
	const case_ = {
		action: CaseAction.ROLE,
		caseId: 0,
		guildId: '1234',
		moderatorId: '2345',
		reason: 'foo',
		targetId: '3456',
		roleId: '4567',
	};

	const manager = container.resolve(CaseManager);
	const saved = await manager.create(case_);

	expect(saved).toBe(case_);
	expect(saved.caseId).toBe(1);
	expect(mockedRest.put).toHaveBeenCalledTimes(1);
	expect(mockedRest.put).toHaveBeenCalledWith('/guilds/1234/members/3456/roles/4567', {}, { reason: 'foo' });
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
});

test('creates un-role case', async () => {
	const case_ = {
		action: CaseAction.UN_ROLE,
		caseId: 0,
		guildId: '1234',
		moderatorId: '2345',
		reason: 'foo',
		targetId: '3456',
		roleId: '4567',
	};

	const manager = container.resolve(CaseManager);
	const saved = await manager.create(case_);

	expect(saved).toBe(case_);
	expect(saved.caseId).toBe(1);
	expect(mockedRest.delete).toHaveBeenCalledTimes(1);
	expect(mockedRest.delete).toHaveBeenCalledWith('/guilds/1234/members/3456/roles/4567', { reason: 'foo' });
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
});

test('creates warn case with reference', async () => {
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

test('creates kick case with context', async () => {
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
	expect(mockedRest.delete).toHaveBeenCalledWith('/guilds/1234/members/3456', { reason: 'foo' });
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
});

test('creates softban with delete message days', async () => {
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
	expect(mockedRest.put).toHaveBeenCalledWith('/guilds/1234/bans/3456?delete-message-days=3&reason=foo', {
		reason: 'foo',
	});
	expect(mockedRest.delete).toHaveBeenCalledTimes(1);
	expect(mockedRest.delete).toHaveBeenCalledWith('/guilds/1234/bans/3456', { reason: 'Softban: foo' });
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
});

test('creates ban with expiration & default delete message days', async () => {
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
	expect(mockedRest.put).toHaveBeenCalledWith('/guilds/1234/bans/3456?delete-message-days=1&reason=foo', {
		reason: 'foo',
	});
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
});

test('creates unban case', async () => {
	const case_: Case = {
		action: CaseAction.UNBAN,
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
	expect(mockedRest.delete).toHaveBeenCalledTimes(1);
	expect(mockedRest.delete).toHaveBeenCalledWith('/guilds/1234/bans/3456', { reason: 'foo' });
	expect(mockedPostgres).toHaveBeenCalledTimes(1);
	expect(mockedPostgres).toHaveBeenCalledWith(...generateSQLResult(case_));
});
