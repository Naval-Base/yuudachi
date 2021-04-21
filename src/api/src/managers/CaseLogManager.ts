import {
	RESTGetAPIGuildRolesResult,
	APIMessage,
	APIEmbed,
	Routes,
	RESTGetAPIUserResult,
	Snowflake,
} from 'discord-api-types/v8';
import { CaseAction } from '@yuudachi/types';
import { stripIndents } from 'common-tags';
import { inject, injectable } from 'tsyringe';
import type { Sql } from 'postgres';
import Rest from '@yuudachi/rest';
import { Tokens } from '@yuudachi/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import type { RawCase } from './CaseManager';
import SettingsManager, { SettingsKeys } from './SettingsManager';

const { kSQL } = Tokens;

@injectable()
export default class CaseLogManager {
	public constructor(
		@inject(kSQL)
		public readonly sql: Sql<any>,
		public readonly rest: Rest,
		public readonly settings: SettingsManager,
	) {}

	public async create(item: RawCase /* , old?: RawCase */) {
		const logChannelId = await this.settings.get(item.guild_id, SettingsKeys.MOD_LOG_CHANNEL_ID, 'guild_settings');
		if (!logChannelId) {
			throw new Error('no mod log channel configured');
		}

		/* if (item.action_processed && old && !old.action_processed) {
			return;
		} */

		const mod = await this.rest.get<RESTGetAPIUserResult>(`/users/${item.mod_id}`);
		const avatar = mod.avatar
			? `http://cdn.discordapp.com/avatars/${mod.id}/${mod.avatar}.${mod.avatar.startsWith('a_') ? 'gif' : 'png'}`
			: `http://cdn.discordapp.com/embed/avatars/${Number(mod.discriminator) % 5}.png`;
		const embed: APIEmbed = {
			author: {
				name: `${item.mod_tag} (${item.mod_id})`,
				icon_url: avatar,
			},
			description: await this.generateLogMessage(item, logChannelId),
			footer: {
				text: `Case ${item.case_id}`,
			},
			timestamp: new Date().toISOString(),
		};

		if (item.log_message_id) {
			await this.rest.patch(Routes.channelMessage(logChannelId as Snowflake, item.log_message_id), { embed });
		} else {
			const logMessage: APIMessage = await this.rest.post(Routes.channelMessages(logChannelId as Snowflake), {
				embed,
			});

			await this.sql`
				update cases
				set log_message_id = ${logMessage.id}
				where guild_id = ${item.guild_id}
					and case_id = ${item.case_id}`;
		}
	}

	protected async generateLogMessage(case_: RawCase, logChannelId: string) {
		let action = CaseAction[case_.action];
		if ((case_.action === CaseAction.ROLE || case_.action === CaseAction.UNROLE) && case_.role_id) {
			const roles: RESTGetAPIGuildRolesResult = await this.rest.get(`/guilds/${case_.guild_id}/roles`);
			const role = roles.find((role) => role.id === case_.role_id);

			if (role) action += ` \`${role.name}\` (${case_.role_id})`;
		}

		let msg = stripIndents`
			**Member:** \`${case_.target_tag}\` (${case_.target_id})
			**Action:** ${action[0].toUpperCase() + action.substr(1).toLowerCase()}
		`;

		if (case_.action_expiration) {
			msg += `\n**Expiration:** ${dayjs(case_.action_expiration).from(case_.created_at, true)}`;
		}

		if (case_.context_message_id) {
			const [contextMessage] = await this.sql<[{ channel_id: string }?]>`
				select channel_id
				from messages
				where id = ${case_.context_message_id}`;

			if (Reflect.has(contextMessage ?? {}, 'channel_id')) {
				msg += `\n**Context:** [Beam me up, Yuu](https://discordapp.com/channels/${case_.guild_id}/${
					contextMessage!.channel_id
				}/${case_.context_message_id})`;
			}
		}

		if (case_.reason) {
			msg += `\n**Reason:** ${case_.reason}`;
		} else {
			const prefix = await this.settings.get(case_.guild_id, SettingsKeys.PREFIX);
			msg += `\n**Reason:** Use \`${prefix ?? '?'}reason ${case_.case_id} <...reason>\` to set a reason for this case`;
		}

		if (case_.ref_id) {
			const [reference] = await this.sql<[{ log_message_id: string | null }?]>`
				select log_message_id
				from cases
				where guild_id = ${case_.guild_id}
					and case_id = ${case_.ref_id}`;

			if (Reflect.has(reference ?? {}, 'log_message_id')) {
				if (reference!.log_message_id) {
					msg += `\n**Ref case:** [${case_.ref_id}](https://discordapp.com/channels/${case_.guild_id}/${logChannelId}/${
						reference!.log_message_id
					})`;
				}
			}
		}

		return msg;
	}
}
