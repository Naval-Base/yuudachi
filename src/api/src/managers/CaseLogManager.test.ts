import 'reflect-metadata';

import { stripIndents } from 'common-tags';
import Rest from '@yuudachi/rest';
import { CaseAction } from '@yuudachi/types';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { Routes } from 'discord-api-types';

import CaseLogManager from './CaseLogManager';
import SettingsManager, { SettingsKeys } from './SettingsManager';

const { kSQL } = Tokens;

jest.mock('@yuudachi/rest');
jest.mock('./SettingsManager');

const mockedRest: jest.Mocked<Rest> = new (Rest as any)();
const mockedPostgres = jest.fn();
const mockedSettingsManager: jest.Mocked<SettingsManager> = new (SettingsManager as any)();

container.register(kSQL, { useValue: mockedPostgres });
container.register(Rest, { useValue: mockedRest });
container.register(SettingsManager, { useValue: mockedSettingsManager });

const NOW = new Date().toISOString();

// Mock data used in testing
const caseId = 1;
const refCaseId = 2;
const guildId = '1234';
const logChannelId = '2345';
const refLogMessageId = '3456';
const logMessageId = '4567';
const modId = '5678';
const modTag = 'abc#0001';
const targetId = '9012';
const targetTag = 'def#0002';
const roleId = '12345';
const roleName = 'bar';
const contextChannelId = '23456';
const contextMessageId = '34567';
const actionExpiration = new Date(Date.parse(NOW) + 3e5).toISOString();

mockedSettingsManager.get.mockImplementation((_, prop) => {
	switch (prop) {
		case SettingsKeys.MOD_LOG_CHANNEL_ID:
			return Promise.resolve(logChannelId);
		case SettingsKeys.PREFIX:
			return Promise.resolve('?');
	}

	throw new Error('unexpected prop');
});

// eslint-disable-next-line no-extend-native
Date.prototype.toISOString = jest.fn(() => NOW);

// there is only one rest call that happens during case creation
let restCalls = 0;
mockedRest.post.mockImplementation(() => {
	switch (restCalls++) {
		case 0:
			return Promise.resolve({ id: logMessageId });
		default:
			return Promise.resolve({});
	}
});

afterEach(() => {
	restCalls = 0;

	jest.clearAllMocks();
});

test('fails when no log channel is available', async () => {
	mockedSettingsManager.get.mockResolvedValueOnce(null);

	const logManager = container.resolve(CaseLogManager);
	await expect(() =>
		logManager.create({
			action: CaseAction.KICK,
			action_expiration: null,
			action_processed: true,
			case_id: caseId,
			context_message_id: null,
			created_at: new Date().toISOString(),
			guild_id: guildId,
			log_message_id: null,
			mod_id: modId,
			mod_tag: modTag,
			reason: 'foo',
			ref_id: null,
			role_id: null,
			target_id: targetId,
			target_tag: targetTag,
		}),
	).rejects.toStrictEqual(new Error('no mod log channel configured'));
});

describe('create', () => {
	test('basic kick case', async () => {
		mockedRest.get.mockResolvedValueOnce({ id: modId, avatar: 'a_randomHash', discriminator: '0002' });

		const logManager = container.resolve(CaseLogManager);
		await logManager.create({
			action: CaseAction.KICK,
			action_expiration: null,
			action_processed: true,
			case_id: caseId,
			context_message_id: null,
			created_at: new Date().toISOString(),
			guild_id: guildId,
			log_message_id: null,
			mod_id: modId,
			mod_tag: modTag,
			reason: 'foo',
			ref_id: null,
			role_id: null,
			target_id: targetId,
			target_tag: targetTag,
		});

		expect(mockedSettingsManager.get).toHaveBeenCalledTimes(1);
		expect(mockedSettingsManager.get).toHaveBeenCalledWith(guildId, SettingsKeys.MOD_LOG_CHANNEL_ID);

		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenLastCalledWith(
			[
				`
				update moderation.cases
				set log_message_id = `,
				`
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			logMessageId,
			guildId,
			1,
		);

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(`/channels/${logChannelId}/messages`, {
			embed: {
				author: {
					name: `${modTag} (${modId})`,
					icon_url: `http://cdn.discordapp.com/avatars/${modId}/a_randomHash.gif`,
				},
				description: stripIndents`
					**Member:** \`${targetTag}\` (${targetId})
					**Action:** Kick
					**Reason:** foo`,
				footer: {
					text: `Case ${caseId}`,
				},
				timestamp: NOW,
			},
		});
	});

	test('reference role case', async () => {
		mockedPostgres.mockResolvedValue([{ log_message_id: refLogMessageId }]);
		mockedRest.get
			.mockResolvedValueOnce({ id: modId, discriminator: '0002' })
			.mockResolvedValueOnce([{ id: roleId, name: roleName }]);

		const logManager = container.resolve(CaseLogManager);
		await logManager.create({
			action: CaseAction.ROLE,
			action_expiration: null,
			action_processed: true,
			case_id: caseId,
			context_message_id: null,
			created_at: new Date().toISOString(),
			guild_id: guildId,
			log_message_id: null,
			mod_id: modId,
			mod_tag: modTag,
			reason: 'foo',
			ref_id: refCaseId,
			role_id: roleId,
			target_id: targetId,
			target_tag: targetTag,
		});

		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenNthCalledWith(
			1,
			[
				`
				select log_message_id
				from moderation.cases
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			guildId,
			refCaseId,
		);

		expect(mockedRest.get).toHaveBeenCalledTimes(2);
		expect(mockedRest.get).toHaveBeenCalledWith(`/guilds/${guildId}/roles`);

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(`/channels/${logChannelId}/messages`, {
			embed: {
				author: {
					name: `${modTag} (${modId})`,
					icon_url: `http://cdn.discordapp.com/embed/avatars/2.png`,
				},
				description: stripIndents`
					**Member:** \`${targetTag}\` (${targetId})
					**Action:** Role \`${roleName}\` (${roleId})
					**Reason:** foo
					**Ref case:** [${refCaseId}](https://discordapp.com/channels/${guildId}/${logChannelId}/${refLogMessageId})`,
				footer: {
					text: `Case ${caseId}`,
				},
				timestamp: NOW,
			},
		});
	});

	test('contextual softban case', async () => {
		mockedPostgres.mockResolvedValue([{ channel_id: contextChannelId }]);
		mockedRest.get.mockResolvedValue({ id: modId, avatar: 'randomHash', discriminator: '0002' });

		const logManager = container.resolve(CaseLogManager);
		await logManager.create({
			action: CaseAction.SOFTBAN,
			action_expiration: null,
			action_processed: true,
			case_id: caseId,
			context_message_id: contextMessageId,
			created_at: new Date().toISOString(),
			guild_id: guildId,
			log_message_id: null,
			mod_id: modId,
			mod_tag: modTag,
			reason: 'foo',
			ref_id: null,
			role_id: null,
			target_id: targetId,
			target_tag: targetTag,
		});

		expect(mockedPostgres).toHaveBeenCalledTimes(2);
		expect(mockedPostgres).toHaveBeenNthCalledWith(
			1,
			[
				`
				select channel_id
				from logs.messages
				where id = `,
				'',
			],
			contextMessageId,
		);

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(`/channels/${logChannelId}/messages`, {
			embed: {
				author: {
					name: `${modTag} (${modId})`,
					icon_url: `http://cdn.discordapp.com/avatars/${modId}/randomHash.png`,
				},
				description: stripIndents`
					**Member:** \`${targetTag}\` (${targetId})
					**Action:** Softban
					**Context:** [Beam me up, Yuu](https://discordapp.com/channels/${guildId}/${contextChannelId}/${contextMessageId})
					**Reason:** foo`,
				footer: {
					text: `Case ${caseId}`,
				},
				timestamp: NOW,
			},
		});
	});

	test('temporary ban case with context and reference', async () => {
		mockedPostgres
			.mockResolvedValueOnce([{ channel_id: contextChannelId }])
			.mockResolvedValueOnce([{ log_message_id: refLogMessageId }]);
		mockedRest.get.mockResolvedValue({ id: modId, avatar: 'randomHash', discriminator: '0002' });

		const logManager = container.resolve(CaseLogManager);
		await logManager.create({
			action: CaseAction.BAN,
			action_expiration: actionExpiration,
			action_processed: true,
			case_id: caseId,
			context_message_id: contextMessageId,
			created_at: new Date().toISOString(),
			guild_id: guildId,
			log_message_id: null,
			mod_id: modId,
			mod_tag: modTag,
			reason: 'foo',
			ref_id: refCaseId,
			role_id: null,
			target_id: targetId,
			target_tag: targetTag,
		});

		expect(mockedPostgres).toHaveBeenCalledTimes(3);
		expect(mockedPostgres).toHaveBeenNthCalledWith(
			1,
			[
				`
				select channel_id
				from logs.messages
				where id = `,
				'',
			],
			contextMessageId,
		);
		expect(mockedPostgres).toHaveBeenNthCalledWith(
			2,
			[
				`
				select log_message_id
				from moderation.cases
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			guildId,
			refCaseId,
		);

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(`/channels/${logChannelId}/messages`, {
			embed: {
				author: {
					name: `${modTag} (${modId})`,
					icon_url: `http://cdn.discordapp.com/avatars/${modId}/randomHash.png`,
				},
				description: stripIndents`
					**Member:** \`${targetTag}\` (${targetId})
					**Action:** Ban
					**Expiration:** ${dayjs(actionExpiration).fromNow(true)}
					**Context:** [Beam me up, Yuu](https://discordapp.com/channels/${guildId}/${contextChannelId}/${contextMessageId})
					**Reason:** foo
					**Ref case:** [${refCaseId}](https://discordapp.com/channels/${guildId}/${logChannelId}/${refLogMessageId})`,
				footer: {
					text: `Case ${caseId}`,
				},
				timestamp: NOW,
			},
		});
	});

	test('ban without a reason', async () => {
		mockedPostgres.mockResolvedValue({ value: '?' });
		mockedRest.get.mockResolvedValue({ id: modId, avatar: 'randomHash', discriminator: '0002' });

		const logManager = container.resolve(CaseLogManager);
		await logManager.create({
			action: CaseAction.BAN,
			action_expiration: null,
			action_processed: true,
			case_id: caseId,
			context_message_id: null,
			created_at: new Date().toISOString(),
			guild_id: guildId,
			log_message_id: null,
			mod_id: modId,
			mod_tag: modTag,
			reason: null,
			ref_id: null,
			role_id: null,
			target_id: targetId,
			target_tag: targetTag,
		});

		expect(mockedPostgres).toHaveBeenCalledTimes(1);
		expect(mockedPostgres).toHaveBeenLastCalledWith(
			[
				`
				update moderation.cases
				set log_message_id = `,
				`
				where guild_id = `,
				`
					and case_id = `,
				'',
			],
			logMessageId,
			guildId,
			1,
		);

		expect(mockedRest.post).toHaveBeenCalledTimes(1);
		expect(mockedRest.post).toHaveBeenCalledWith(`/channels/${logChannelId}/messages`, {
			embed: {
				author: {
					name: `${modTag} (${modId})`,
					icon_url: `http://cdn.discordapp.com/avatars/${modId}/randomHash.png`,
				},
				description: stripIndents`
					**Member:** \`${targetTag}\` (${targetId})
					**Action:** Ban
					**Reason:** Use \`?reason 1 <...reason>\` to set a reason for this case`,
				footer: {
					text: `Case ${caseId}`,
				},
				timestamp: NOW,
			},
		});
	});
});

test('updates a ban with a reason', async () => {
	mockedPostgres.mockResolvedValue({ value: '?' });
	mockedRest.get.mockResolvedValue({ id: modId, avatar: 'randomHash', discriminator: '0002' });

	const logManager = container.resolve(CaseLogManager);
	await logManager.create({
		action: CaseAction.BAN,
		action_expiration: null,
		action_processed: true,
		case_id: caseId,
		context_message_id: null,
		created_at: new Date().toISOString(),
		guild_id: guildId,
		log_message_id: logMessageId,
		mod_id: modId,
		mod_tag: modTag,
		reason: 'foo',
		ref_id: null,
		role_id: null,
		target_id: targetId,
		target_tag: targetTag,
	});

	expect(mockedRest.patch).toHaveBeenCalledTimes(1);
	expect(mockedRest.patch).toHaveBeenCalledWith(Routes.channelMessage(logChannelId, logMessageId), {
		embed: {
			author: {
				name: `${modTag} (${modId})`,
				icon_url: `http://cdn.discordapp.com/avatars/${modId}/randomHash.png`,
			},
			description: stripIndents`
				**Member:** \`${targetTag}\` (${targetId})
				**Action:** Ban
				**Reason:** foo`,
			footer: {
				text: `Case ${caseId}`,
			},
			timestamp: NOW,
		},
	});
});
