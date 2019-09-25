import { Listener } from 'discord-akairo';
import { MessageEmbed, VoiceState } from 'discord.js';
import { SETTINGS } from '../../util/constants';

export default class VoiceStateUpdateListener extends Listener {
	public constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
			category: 'client',
		});
	}

	public async exec(oldState: VoiceState, newState: VoiceState) {
		if ((oldState && oldState.member && oldState.member.user.bot) || (newState.member && newState.member.user.bot)) {
			return;
		}
		const guildLogs = this.client.settings.get<string>(newState.guild, SETTINGS.GUILD_LOG, undefined);
		if (guildLogs) {
			const webhook = this.client.webhooks.get(guildLogs);
			if (!webhook) return;
			if (!newState.member) return;
			const embed = new MessageEmbed()
				.setColor(0x33ffff)
				.setAuthor(`${newState.member.user.tag} (${newState.member.id})`, newState.member.user.displayAvatarURL())
				.setTimestamp(new Date())
				.setFooter('Voice State Updated');

			if ((!oldState || (oldState && !oldState.channel)) && newState.channel) {
				embed.addField('❯ Joined', newState.channel);
			} else if (oldState && oldState.channel && newState.channel && oldState.channelID !== newState.channelID) {
				embed.addField('❯ From', oldState.channel).addField('❯ To', newState.channel);
			} else if (oldState && oldState.channel && !newState.channel) {
				embed.addField('❯ Left', oldState.channel);
			} else {
				return;
			}

			return webhook.send({
				embeds: [embed],
				username: 'Logs: VOICE STATE UPDATE',
				avatarURL: 'https://i.imgur.com/wmsJNiu.png',
			});
		}
	}
}
