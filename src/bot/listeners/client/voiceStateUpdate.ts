import { Listener } from 'discord-akairo';
import { Message, MessageEmbed, VoiceState } from 'discord.js';

export default class VoiceStateUpdateListener extends Listener {
	public constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
			category: 'client'
		});
	}

	public async exec(oldState: VoiceState, newState: VoiceState): Promise<Message | Message[] | void> {
		if ((oldState && oldState.member && oldState.member.user.bot) || (newState.member && newState.member.user.bot)) return;
		const guildLogs = this.client.settings.get(newState.guild, 'guildLogs', undefined);
		if (guildLogs) {
			const webhook = this.client.webhooks.get(guildLogs);
			if (!webhook) return;
			const embed = new MessageEmbed()
				.setColor(0x33ffff)
				.setAuthor(`${newState.member!.user.tag} (${newState.member!.id})`, newState.member!.user.displayAvatarURL())
				.setTimestamp(new Date())
				.setFooter('Voice State Updated');

			if ((!oldState || (oldState && !oldState.channel)) && newState.channel) {
				embed.addField('❯ Joined', newState.channel);
			} else if (oldState && oldState.channel && newState.channel) {
				embed.addField('❯ From', oldState.channel)
					.addField('❯ To', newState.channel);
			} else if (oldState && oldState.channel && !newState.channel) {
				embed.addField('❯ Left', oldState.channel);
			}

			return webhook.send({
				embeds: [embed],
				username: 'Logs: VOICE STATE UPDATE',
				avatarURL: 'https://i.imgur.com/wmsJNiu.png'
			});
		}
	}
}
