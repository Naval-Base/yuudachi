import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { MESSAGES, SETTINGS } from '../../util/constants';

const { GITHUB_API_KEY } = process.env;

export default class GitHubCommitCommand extends Command {
	public constructor() {
		super('gh-commit', {
			aliases: ['gh-commit', 'commit'],
			description: {
				content: MESSAGES.COMMANDS.GITHUB.COMMIT.DESCRIPTION,
				usage: '<commit>',
				examples: ['8335f499c5e0cfac1267d426d854a2209416595f', 'd9f772cdc1139b9a118be4321fe719ffa0dfc2fa'],
			},
			regex: /\bgc#[a-f0-9]{40}$/i,
			category: 'github',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'commit',
					match: 'content',
					type: Argument.validate('string', (_, str) => str.length >= 40),
				},
			],
		});
	}

	public async exec(message: Message, args: any) {
		if (!GITHUB_API_KEY) {
			return message.util?.reply(MESSAGES.COMMANDS.GITHUB.COMMIT.NO_GITHUB_API_KEY);
		}
		const guild = message.guild!;
		const repository = this.client.settings.get(guild, SETTINGS.GITHUB_REPO);
		if (!repository) return message.reply(MESSAGES.COMMANDS.GITHUB.COMMIT.NO_GITHUB_REPO);
		const owner = repository.split('/')[0];
		const repo = repository.split('/')[1];
		const commit = args.match ? args.match[0].split('#')[1] : args.commit;
		let body;
		try {
			const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commit}`, {
				headers: { Authorization: `token ${GITHUB_API_KEY}` },
			});
			body = await res.json();
		} catch (error) {
			return message.util?.reply(MESSAGES.COMMANDS.GITHUB.COMMIT.FAILURE);
		}
		if (!body?.commit) {
			return message.util?.reply(MESSAGES.COMMANDS.GITHUB.COMMIT.FAILURE);
		}
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setAuthor(body.author?.login ?? 'Unknown', body.author?.avatar_url ?? '', body.author?.html_url ?? '')
			.setTitle(body.commit.message.split('\n')[0])
			.setURL(body.html_url)
			.setDescription(
				`${body.commit.message
					.replace('\r', '')
					.replace('\n\n', '\n')
					.split('\n')
					.slice(1)
					.join('\n')
					.substring(0, 300)} ...
			`,
			)
			.addField(
				'Stats',
				stripIndents`
					• Total: ${body.stats.total}
					• Additions: ${body.stats.additions}
					• Deletions: ${body.stats.deletions}
				`,
				true,
			)
			.addField(
				'Committer',
				body.committer ? `• [**${body.committer.login}**](${body.committer.html_url})` : 'Unknown',
				true,
			)
			.setThumbnail(body.author?.avatar_url ?? '')
			.setTimestamp(new Date(body.commit.author.date));

		if (
			!(message.channel as TextChannel)
				.permissionsFor(guild.me ?? '')
				?.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES], false)
		) {
			return message.util?.send(embed);
		}
		const msg = await message.util?.send(embed);
		if (!msg) return message;
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 10000, errors: ['time'] },
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first()?.message.delete();

		return message;
	}
}
