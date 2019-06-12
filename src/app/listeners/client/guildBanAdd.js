const { Listener } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class GuildBanAddListener extends Listener {
	constructor() {
		super('guildBanAdd', {
			event: 'guildBanAdd',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(guild, user) {
		if (!this.client.settings.get(guild, 'moderation', undefined)) return;
		if (this.client.cached.delete(`CASE:${guild.id}:${user.id}:BAN`)) return;
		const totalCases = this.client.settings.get(guild, 'caseTotal', 0) + 1;
		this.client.settings.set(guild, 'caseTotal', totalCases);

		const modLog = this.client.settings.get(guild, 'modLog', undefined);
		const prefix = this.client.commandHandler.prefix({ guild });
		const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;

		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ member: user, action: 'Ban', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.BAN);
			msg = await this.client.channels.get(modLog).send(embed);
		}
		await Case.create({
			case_id: totalCases,
			target_id: user.id,
			target_tag: user.tag,
			guild: guild.id,
			reason,
			action: CONSTANTS.ACTIONS.BAN,
			createdAt: moment.utc().toDate(),
			message: msg ? msg.id : undefined
		});
	}
}

module.exports = GuildBanAddListener;
