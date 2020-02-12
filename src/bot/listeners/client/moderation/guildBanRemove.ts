import { Listener, PrefixSupplier } from 'discord-akairo';
import { Guild, Message, TextChannel, User } from 'discord.js';
import { ACTIONS, COLORS, SETTINGS } from '../../../util/constants';

export default class GuildBanRemoveModerationListener extends Listener {
	public constructor() {
		super('guildBanRemoveModeration', {
			emitter: 'client',
			event: 'guildBanRemove',
			category: 'client',
		});
	}

	public async exec(guild: Guild, user: User) {
		if (!this.client.settings.get(guild, SETTINGS.MODERATION)) return;
		if (this.client.caseHandler.cachedCases.delete(`${guild.id}:${user.id}:UNBAN`)) return;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0) + 1;
		this.client.settings.set(guild, SETTINGS.CASES, totalCases);
		const modLogChannel = this.client.settings.get(guild, SETTINGS.MOD_LOG);
		let modMessage;
		if (modLogChannel) {
			const prefix = (this.client.commandHandler.prefix as PrefixSupplier)({ guild } as Message);
			const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
			const embed = (
				await this.client.caseHandler.log({
					member: user,
					action: 'Unban',
					caseNum: totalCases,
					reason,
					message: { author: null, guild },
					nsfw: true,
				})
			).setColor(COLORS.UNBAN);
			modMessage = await (this.client.channels.cache.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.caseHandler.create({
			guild: guild.id,
			message: modMessage?.id,
			caseId: totalCases,
			targetId: user.id,
			targetTag: user.tag,
			action: ACTIONS.UNBAN,
		});
	}
}
