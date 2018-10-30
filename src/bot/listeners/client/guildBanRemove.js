const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const ACTIONS = {
	BAN: 1,
	UNBAN: 2,
	SOFTBAN: 3,
	KICK: 4,
	MUTE: 5,
	EMBED: 6,
	EMOJI: 7,
	REACTION: 8
};

class GuildBanRemoveListener extends Listener {
	constructor() {
		super('guildBanRemove', {
			emitter: 'client',
			event: 'guildBanRemove',
			category: 'client'
		});
	}

	async exec(guild, user) {
		if (this.client._cachedCases.delete(`${guild.id}:${user.id}:UNBAN`)) return;
		const totalCases = this.client.settings.get(guild, 'caseTotal', 0) + 1;
		this.client.settings.set(guild, 'caseTotal', totalCases);
		const modLogChannel = this.client.settings.get(guild, 'modLogChannel');
		let modMessage;
		if (modLogChannel) {
			const embed = new MessageEmbed()
				.setDescription(stripIndents`
					**Member:** ${user.tag} (${user.id})
					**Action:** Unban
					**Reason:** Use \`?reason ${totalCases} <...reason>\` to set a reason for this case
				`)
				.setFooter(`Case ${totalCases}`)
				.setTimestamp(new Date());
			modMessage = await this.client.channels.get(modLogChannel).send(embed);
		}
		await this.client.db.models.cases.create({
			guild: guild.id,
			message: modMessage ? modMessage.id : null,
			case_id: totalCases,
			target_id: user.id,
			target_tag: user.tag,
			action: ACTIONS.UNBAN
		});
	}
}

module.exports = GuildBanRemoveListener;
