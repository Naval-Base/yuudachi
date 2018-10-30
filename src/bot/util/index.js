const { MessageEmbed, User } = require('discord.js');
const { stripIndents } = require('common-tags');
const ms = require('@naval-base/ms');

module.exports = {
	CONSTANTS: {
		ACTIONS: {
			BAN: 1,
			UNBAN: 2,
			SOFTBAN: 3,
			KICK: 4,
			MUTE: 5,
			EMBED: 6,
			EMOJI: 7,
			REACTION: 8,
			WARN: 9
		},
		COLORS: {
			BAN: 16718080,
			UNBAN: 8450847,
			SOFTBAN: 16745216,
			KICK: 16745216,
			MUTE: 16763904,
			RESTRICT: 16776960,
			WARN: 16776960
		}
	},
	reminderEmbed: (message, reminders) => {
		const truncate = (str, len) => str.length > len ? `${str.slice(0, len)}…` : str; // eslint-disable-line
		return new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setColor(0x30A9ED)
			.setDescription(reminders.length
				? reminders.sort((a, b) => a.triggers_at - b.triggers_at).map(
					(reminder, i) => `${i + 1}. ${truncate(reminder.reason || 'reasonless', 30)} \`${reminder.triggers_at.toUTCString()}\`${reminder.channel ? '' : ' (DM)'}`
				).join('\n')
				: 'No reminders');
	},
	logEmbed: ({ message = null, member, action, duration = null, caseNum, reason, ref = null }) => {
		const embed = new MessageEmbed();
		if (message) {
			embed.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL());
		}
		embed.setDescription(stripIndents`
				**Member:** ${member instanceof User ? member.tag : member.user.tag} (${member.id})
				**Action:** ${action}${action === 'Mute' ? `\n**Length:** ${ms(duration, { 'long': true })}` : ''}
				**Reason:** ${reason}${ref ? `\n**Ref case:** ${ref}` : ''}
			`)
			.setFooter(`Case ${caseNum}`)
			.setTimestamp(new Date());

		return embed;
	}
};
