import { on } from "node:events";
import { inject, injectable } from "@needle-di/core";
import { logger, kWebhooks } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type GuildMember, type Webhook } from "discord.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import { generateMemberLog } from "../../util/generateMemberLog.js";

@injectable()
export default class implements Event {
	public name = "Member log remove";

	public event = Events.GuildMemberRemove as const;

	public constructor(
		public readonly client: Client<true> = inject(Client),
		public readonly webhooks: Map<string, Webhook> = inject(kWebhooks),
	) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				const guildLogWebhookId = await getGuildSetting(guildMember.guild.id, SettingsKeys.MemberLogWebhookId);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				const locale = await getGuildSetting(guildMember.guild.id, SettingsKeys.Locale);

				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					`Member ${guildMember.id} left`,
				);

				await webhook.send({
					embeds: [generateMemberLog(guildMember, locale, false)],
					username: this.client.user.username,
					avatarURL: this.client.user.displayAvatarURL(),
				});
			} catch (error) {
				const error_ = error as Error;
				logger.error(error_, error_.message);
			}
		}
	}
}
