import 'reflect-metadata';

import Rest from '@spectacles/rest';
import postgres, { SQL } from 'postgres';
import { container } from 'tsyringe';
import CaseLogManager from './CaseLogManager';
import { CaseAction } from './CaseManager';
import { SettingsKeys } from './SettingsManager';
import { kSQL } from '../tokens';

jest.mock('@spectacles/rest');
jest.mock('postgres', () => jest.fn(() => jest.fn()));

const mockedRest: jest.Mocked<Rest> = new Rest() as any;
const mockedPostgres: jest.MockedFunction<SQL> = postgres() as any;

container.register(kSQL, { useValue: mockedPostgres });
container.register(Rest, { useValue: mockedRest });

const NOW = Date.now();
Date.now = jest.fn(() => NOW);

test('creates basic ban case', async () => {
	const caseId = 1;
	const guildId = '1234';
	const logChannelId = '2345';
	const logMessageId = '4567';
	const modId = '5678';
	const modTag = 'abc#0001';
	const targetId = '9012';
	const targetTag = 'def#0002';

	let sqlCalls = 0;
	mockedPostgres.mockImplementation((): any => {
		switch (sqlCalls++) {
			case 0:
				return Promise.resolve([{ value: logChannelId }]);
			default:
				return Promise.resolve([]);
		}
	});

	let restCalls = 0;
	mockedRest.post.mockImplementation(() => {
		switch (restCalls++) {
			case 0:
				return Promise.resolve({ id: logMessageId });
			default:
				return Promise.resolve({});
		}
	});

	const logManager = container.resolve(CaseLogManager);

	await logManager.create({
		action: CaseAction.BAN,
		action_expiration: null,
		action_processed: true,
		case_id: caseId,
		context_message_id: null,
		created_at: new Date().toString(),
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
	expect(mockedPostgres).toHaveBeenNthCalledWith(1, [`
			select value
			from guild_settings
			where guild_id = `,`
				and key = `,''], guildId, SettingsKeys.MOD_LOG_CHANNEL_ID);

	expect(mockedPostgres).toHaveBeenLastCalledWith([`
			update cases
			set log_message_id = `,`
			where id = `,`
				and guild_id = `,''], logMessageId, 1, guildId);

	expect(mockedRest.post).toHaveBeenCalledTimes(1);
	expect(mockedRest.post).toHaveBeenCalledWith(`/channels/2345/messages`, {
		embed: {
			title: `${modTag} (${modId})`,
			description: `**Member:** ${targetTag} (${targetId})\n**Action:** BAN\n**Reason:** foo`,
			footer: `Case ${caseId}`,
			timestamp: NOW,
		},
	});
});
