import { Listener, PrefixSupplier } from 'discord-akairo';
import { Message, Guild, User, TextChannel } from 'discord.js';
import { ACTIONS, COLORS } from '../../util';

export default class GuildBanRemoveListener extends Listener {
	public constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove',
			category: 'client'
		});
	}

	public async exec(guild: Guild, user: User) {
		if (!this.client.settings.get<boolean>(guild, 'moderation', undefined)) return;
		if (this.client.cachedCases.delete(`${guild.id}:${user.id}:UNBAN`)) return;
		const totalCases = this.client.settings.get<number>(guild, 'caseTotal', 0) + 1;
		this.client.settings.set(guild, 'caseTotal', totalCases);
		const modLogChannel = this.client.settings.get<string>(guild, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const prefix = (this.client.commandHandler.prefix as PrefixSupplier)({ guild } as Message);
			const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
			const embed = (await this.client.caseHandler.log(user, 'Unban', totalCases, reason, { author: null, guild })).setColor(COLORS.UNBAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.caseHandler.create({
			guild: guild.id,
			message: modMessage ? modMessage.id : undefined,
			case_id: totalCases,
			target_id: user.id,
			target_tag: user.tag,
			action: ACTIONS.UNBAN
		});
	}
}
