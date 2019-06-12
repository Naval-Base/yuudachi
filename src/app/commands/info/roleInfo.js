const { Command } = require('discord-akairo');
const moment = require('moment');

const PERMISSIONS = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Text & See Voice Channels',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity'
};

class RoleInfoCommad extends Command {
	constructor() {
		super('roleinfo', {
			aliases: ['role', 'role-info'],
			category: 'info',
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			description: {
				content: 'Get info about a role.',
				usage: '<role>',
				examples: ['Admin', '@Staff', '444432489818357760']
			},
			args: [
				{
					id: 'role',
					type: 'role',
					match: 'content',
					default: message => message.member.roles.highest
				}
			]
		});
	}

	async exec(message, { role }) {
		const permissions = Object.keys(PERMISSIONS).filter(permission => role.permissions.serialize()[permission]);
		const permission = permissions.map(permission => `\`${PERMISSIONS[permission]}\``).join(', ');

		const embed = this.client.util.embed().setColor(5861569)
			.setAuthor(`${role.name} (${role.id})`)
			.addField('Color', `\`${role.hexColor.toUpperCase()}\`, \`${role.color}\``)
			.addField('Hoisted', `${role.hoist ? 'Yes' : 'No'}`)
			.addField('Mentionable', `${role.mentionable ? 'Yes' : 'No'}`)
			.addField('Creation Date', `${moment.utc(role.createdAt).format('MMMM D, YYYY, kk:mm:ss')}`)
			.addField('Permissions', `${permission || 'None'}`)
			.setThumbnail(message.guild.iconURL());

		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util.send({ embed });
		}
		const msg = await message.util.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 30000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();
			return message;
		}
		react.first().message.delete();
		return message;
	}
}

module.exports = RoleInfoCommad;
