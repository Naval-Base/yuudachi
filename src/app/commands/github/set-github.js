const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const Github = require('../../models/github');
const { MessageEmbed } = require('discord.js');
const { Op } = require('sequelize');
const moment = require('moment');

class GithubLinkCommand extends Command {
	constructor() {
		super('github-set', {
			aliases: ['gh-set', 'github-set', 'gh-link'],
			category: 'github',
			channel: 'guild',
			description: {
				content: 'Links GitHub ID to a Discord account.',
				usage: '<member> <github>',
				examples: ['@Suvajit euvajit', '@Suvajit euvajit']
			}
		});
	}

	*args() {
		const member = yield {
			type: 'member',
			prompt: {
				start: 'what member do you want to link?',
				retry: 'please mention a valid member to link GitHub Id.'
			}
		};
		const github = yield {
			type: async (msg, pharse) => {
				if (!pharse) return null;
				const data = await fetch(`https://api.github.com/users/${pharse}`).then(res => res.json()).catch(() => null);
				if (data.message === 'Not Found') return null;
				return data;
			},
			prompt: {
				start: 'What is your GitHub username?',
				retry: 'Please provide a valid GitHub username.'
			}
		};
		const confirm = yield {
			match: 'none',
			type: (msg, phrase) => {
				if (!phrase) return null;
				if (/^y(?:e(?:a|s)?)?$/i.test(phrase)) return true;
				return false;
			},
			prompt: {
				modifyStart: msg => {
					const content = 'Would you like to link this GitHub account? (Y/N)';
					const embed = new MessageEmbed().setColor('BLACK')
						.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
						.setThumbnail(github.avatar_url)
						.setTitle(`${github.name ? `${github.name} - ${github.login}` : github.login}`)
						.setURL(github.html_url)
						.addField('Repositories', github.public_repos);
					if (github.location) embed.addField('Location', github.location);
					if (github.blog) embed.addField('Blog', github.blog);
					if (github.email) embed.addField('Email', github.email);
					embed.setFooter(`Joined Github on ${moment(github.created_at).format('MMMM D, YYYY')}`, 'https://i.imgur.com/oeZnmD0.png');
					return { embed, content };
				},
				retry: ''
			}
		};
		return { member, github, confirm };
	}

	async exec(message, { member, github, confirm }) {
		if (!confirm) return message.util.reply('command has been cancelled.');
		const userlinked = await Github.findOne({
			where: {
				[Op.or]: [
					{ user: member.user.id },
					{ id: github.id }
				]
			}
		});

		if (userlinked) {
			return message.util.send(`<@${userlinked.user}> is already linked to **${userlinked.login} (${userlinked.id})**`);
		}
		await Github.create({
			guild: message.guild.id,
			user: member.user.id,
			login: github.login,
			id: github.id
		});

		return message.util.send(`**${member.user.tag}** has been successfully linked to **${github.name ? `${github.name} - ${github.login}` : github.login}**`);
	}
}

module.exports = GithubLinkCommand;
