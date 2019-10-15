import { Listener, PrefixSupplier } from 'discord-akairo';
import { Guild, Message, TextChannel, User } from 'discord.js';
import { ACTIONS, COLORS, SETTINGS } from '../../../util/constants';

export default class GuildBanAddModerationListener extends Listener {
	public constructor() {
		super('guildBanAddModeration', {
			emitter: 'client',
			event: 'guildBanAdd',
			category: 'client',
		});
	}

	public async exec(guild: Guild, user: User) {
		if (!this.client.settings.get(guild, SETTINGS.MODERATION)) return;
		if (this.client.caseHandler.cachedCases.delete(`${guild.id}:${user.id}:BAN`)) return;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0) + 1;
		this.client.settings.set(guild, SETTINGS.CASES, totalCases);
		const modLogChannel = this.client.settings.get(guild, SETTINGS.MOD_LOG);
		let modMessage;
		if (modLogChannel) {
			const prefix = (this.client.commandHandler.prefix as PrefixSupplier)({ guild } as Message);
			const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
			const embed = (await this.client.caseHandler.log({
				member: user,
				action: 'Ban',
				caseNum: totalCases,
				reason,
				message: { author: null, guild },
			})).setColor(COLORS.BAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.caseHandler.create({
			guild: guild.id,
			message: modMessage?.id,
			case_id: totalCases,
			target_id: user.id,
			target_tag: user.tag,
			action: ACTIONS.BAN,
		});
	}
}
