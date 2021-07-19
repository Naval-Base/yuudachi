import { Client, Constants, GuildMember } from 'discord.js';
import { on } from 'node:events';
import { injectable } from 'tsyringe';

import type { Event } from '../../Event';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { generateMemberLog } from '../../util/generateMemberLog';

@injectable()
export default class implements Event {
	public name = 'Member log add';

	public event = Constants.Events.GUILD_MEMBER_ADD;

	public constructor(public readonly client: Client) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				const logChannel = await checkLogChannel(
					guildMember.guild,
					await getGuildSetting(guildMember.guild.id, SettingsKeys.MemberLogChannelId),
				);
				if (!logChannel) {
					continue;
				}

				// @ts-ignore
				await logChannel.send({ embeds: [generateMemberLog(guildMember)] });
			} catch (e) {
				logger.error(e);
			}

			continue;
		}
	}
}
