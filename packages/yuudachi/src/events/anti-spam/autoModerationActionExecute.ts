import { on } from 'events';
import { Client, Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { handleAntiSpam } from '../../functions/anti-spam/handler.js';
import { logger } from '../../logger.js';
import { APIAutoModerationRuleActionType, GatewayAutoModerationActionExecution } from '../../util/tempAutomodTypes.js';

@injectable()
export default class implements Event {
	public name = 'Auto-mod spam handler';

	public event = Events.Raw as const;

	public constructor(@inject(Client) public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const [rawData] of on(this.client, this.event) as AsyncIterableIterator<
			[
				{
					op: number;
					t: string;
					d: any;
				},
			]
		>) {
			try {
				if (rawData.t !== 'AUTO_MODERATION_ACTION_EXECUTION') {
					continue;
				}

				const automodAction = rawData.d as GatewayAutoModerationActionExecution;

				if (automodAction.action.type !== APIAutoModerationRuleActionType.BlockMessage) continue;

				const guild = await this.client.guilds.fetch(automodAction.guild_id);
				const member = await guild.members.fetch(automodAction.user_id);

				if (!automodAction.content.length) {
					continue;
				}

				await handleAntiSpam(member, automodAction.content, { name: this.name, event: this.event });
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}
