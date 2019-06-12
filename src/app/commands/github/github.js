const { Command, Argument } = require('discord-akairo');
const fetch = require('node-fetch');
const Github = require('../../models/github');
const moment = require('moment');
const { GuildMember } = require('discord.js');

class GithubCommand extends Command {
	constructor() {
		super('github', {
			aliases: ['github', 'gh'],
			category: 'github',
			channel: 'guild',
			description: {
				content: 'Displays your GitHub ID (If linked)',
				usage: '<member>',
				examples: ['', '@Suvajit']
			},
			args: [
				{
					id: 'member',
					type: Argument.union('member', (msg, id) => {
						if (!id) return null;
						return { id };
					}),
					default: message => message.member
				}
			]
		});
	}

	async exec(message, { member }) {
		const isMember = member instanceof GuildMember;
		const github = isMember ? await Github.findOne({ where: { user: member.id } }) : member;
		if (!github) {
			return message.util.send(`**${member.user.tag}** is not linked to any GitHub account.`);
		}
		const data = await fetch(`https://api.github.com/user${isMember ? '/' : 's/'}${github.id}`).then(res => res.json());
		if (data.message === 'Not Found') {
			return message.util.reply('please provide a valid GitHub Id.');
		}

		const embed = this.client.util.embed().setColor('BLACK')
			.setThumbnail(data.avatar_url)
			.setTitle(`${data.name ? `${data.name} -` : ''} ${data.login}`)
			.setURL(data.html_url)
			.addField('Repositories', data.public_repos);
		if (isMember) embed.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL());
		if (data.location) embed.addField('Location', data.location);
		if (data.blog) embed.addField('Blog', data.blog);
		if (data.email) embed.addField('Email', data.email);
		embed.setFooter(`Joined Github on ${moment(data.created_at).format('MMMM D, YYYY')}`, 'https://i.imgur.com/oeZnmD0.png');
		return message.util.send({ embed });
	}
}

module.exports = GithubCommand;
