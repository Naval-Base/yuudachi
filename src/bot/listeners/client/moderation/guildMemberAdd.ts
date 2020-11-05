import { Listener } from 'discord-akairo';
import { GuildMember, TextChannel } from 'discord.js';
import { SETTINGS, MESSAGES, COLORS, ACTIONS } from '../../../util/constants';

export default class GuildMemberAddAntiraidListener extends Listener {
	public constructor() {
		super('guildMemberAddAntiraid', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const { guild, user } = member;
		if (!this.client.settings.get(guild, SETTINGS.MODERATION)) return;

		const mode = this.client.settings.get(guild, SETTINGS.ANTIRAID_MODE);
		const age = this.client.settings.get(guild, SETTINGS.ANTIRAID_AGE);
		if (!mode || !age) return;

		if (Date.now() - user.createdTimestamp >= age) return;

		if (this.client.caseHandler.cachedCases.delete(`${guild.id}:${user.id}:BAN`)) return;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0) + 1;
		this.client.settings.set(guild, SETTINGS.CASES, totalCases);
		const modLogChannel = this.client.settings.get(guild, SETTINGS.MOD_LOG);

		let modMessage;
		if (modLogChannel) {
			const embed = (
				await this.client.caseHandler.log({
					member: member,
					action: mode === 'BAN' ? 'Ban' : 'Kick',
					caseNum: totalCases,
					reason: MESSAGES.ANTIRAID.REASON,
					message: { author: this.client.user!, guild: guild },
					nsfw: true,
				})
			).setColor(COLORS.ANTIRAID);
			modMessage = await (this.client.channels.cache.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.caseHandler.create({
			guild: guild.id,
			message: modMessage?.id,
			caseId: totalCases,
			targetId: user.id,
			targetTag: user.tag,
			action: mode === 'BAN' ? ACTIONS.BAN : ACTIONS.KICK,
		});
	}
}
