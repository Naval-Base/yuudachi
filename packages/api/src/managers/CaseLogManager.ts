import Rest from '@spectacles/rest';
import { User } from '@spectacles/types';
import { stripIndents } from 'common-tags';
import { has } from 'lodash';
import { inject, injectable } from 'tsyringe';
import { SQL } from 'postgres';
import { RawCase } from './CaseManager';
import { SettingsKeys } from './SettingsManager';
import { kSQL } from '../tokens';

@injectable()
export default class CaseLogManager {
	constructor(
		@inject(kSQL)
		public readonly sql: SQL,
		public readonly rest: Rest,
	) {}

	public async create(item: RawCase): Promise<void> {
		const [setting] = await this.sql`
			select value
			from guild_settings
			where guild_id = ${item.guild_id}
				and key = ${SettingsKeys.MOD_LOG_CHANNEL_ID}`;
		if (!has(setting, 'value')) throw new Error('no mod log channel configured');

		const logChannelId = (setting as { value: string }).value;
		const logMessage = await this.rest.post(
			`/channels/${logChannelId}/messages`,
			{
				embed: {
					description: await this.generateLogMessage(item, logChannelId),
					footer: `Case ${item.case_id}`,
					timestamp: Date.now(),
				},
			},
		);

		await this.sql`
			update cases
			set log_message_id = ${logMessage.id}
			where id = ${item.case_id}
				and guild_id = ${item.guild_id}`;
	}

	public update(item: Partial<RawCase>): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public delete(item: Partial<RawCase>): Promise<void> {
		throw new Error('Method not implemented.');
	}

	protected async generateLogMessage(case_: RawCase, logChannelId: string): Promise<string> {
		const user: User = await this.rest.get(`/users/${case_.target_id}`);

		let msg = stripIndents`
			**Member:** ${user.username}#${user.discriminator} (${case_.target_id})
			**Action:** ${case_.action}
		`;

		if (case_.action_expiration) {
			msg += `\n**Expiration:** ${case_.action_expiration}`;
		}

		if (case_.context_message_id) {
			const [contextMessage] = await this.sql`
				select channel_id
				from messages
				where id = ${case_.context_message_id}`;

			if (has(contextMessage, 'channel_id')) {
				msg += `\n**Context:** [Beam me up, Yuki](https://discordapp.com/channels/${case_.guild_id}/${(contextMessage as { channel_id: string }).channel_id}/${case_.context_message_id})`;
			}
		}

		msg += `\n**Reason:** ${case_.reason}`;
		if (case_.ref_id) {
			const [reference] = await this.sql`
				select log_message_id
				from cases
				where id = ${case_.ref_id}
					and guild_id = ${case_.guild_id}`;

			if (has(reference, 'log_message_id')) {
				msg += `\n**Ref case:** [${case_.ref_id}](https://discordapp.com/channels/${case_.guild_id}/${logChannelId}/${(reference as { log_message_id: string }).log_message_id})`;
			}
		}
		return msg;
	}
}
