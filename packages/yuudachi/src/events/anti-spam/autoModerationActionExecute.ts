import { on } from 'events';
import { Client, Events } from 'discord.js';
import { injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { handleAntiSpam } from '../../functions/anti-spam/handler.js';
import { logger } from '../../logger.js';
import { APIAutoModerationRuleActionType, type GatewayAutoModerationActionExecution } from '../../util/tempAutomodTypes.js';

@injectable()
export default class implements Event {
	public name = 'AutoMod spam handler';

	public event = Events.Raw as const;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const [rawData] of on(this.client, this.event) as AsyncIterableIterator<
			[
				{
					op: number;
					t: string;
					d: GatewayAutoModerationActionExecution;
				},
			]
		>) {
			try {
				if (rawData.t !== 'AUTO_MODERATION_ACTION_EXECUTION') {
					continue;
				}

				const autoModAction = rawData.d;

				if (autoModAction.action.type !== APIAutoModerationRuleActionType.BlockMessage) {
					continue;
				}

				const guild = this.client.guilds.resolve(autoModAction.guild_id);
				const member = await guild.members.fetch(autoModAction.user_id);

				if (!autoModAction.content.length) {
					continue;
				}

				await handleAntiSpam(member, autoModAction.content, { name: this.name, event: this.event });
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}
