import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { MESSAGES } from '../../util/constants';

const { GITHUB_API_KEY } = process.env;

export default class GitHubSearchCommand extends Command {
	public constructor() {
		super('gh-search', {
			aliases: ['gh-search'],
			description: {
				content: MESSAGES.COMMANDS.GITHUB.SEARCH.DESCRIPTION,
				usage: '<commit/pr/issue>',
				examples: ['1Computer1/discord-akairo#1', 'discordjs/discord.js#1', 'discordjs.discord.js#24'],
			},
			category: 'github',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'repo',
					type: 'string',
				},
				{
					id: 'commit',
					type: 'string',
					default: '',
				},
			],
		});
	}

	public async exec(message: Message, { repo, commit }: { repo: string; commit: string }) {
		if (!GITHUB_API_KEY) {
			return message.reply(MESSAGES.COMMANDS.GITHUB.SEARCH.NO_GITHUB_API_KEY);
		}
		if (!repo) return;
		const owner = repo.split('/')[0];
		if (/[a-f0-9]{40}$/i.exec(commit)) {
			const repository = repo.split('/')[1];
			let body;
			try {
				const res = await fetch(`https://api.github.com/repos/${owner}/${repository}/commits/${commit}`, {
					headers: { Authorization: `token ${GITHUB_API_KEY}` },
				});
				body = await res.json();
			} catch (error) {
				return message.util?.reply(MESSAGES.COMMANDS.GITHUB.SEARCH.FAILURE);
			}
			if (!body) {
				return message.util?.reply(MESSAGES.COMMANDS.GITHUB.SEARCH.FAILURE);
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
					.permissionsFor(this.client.user ?? '')
					?.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES], false)
			) {
				return message.util?.send(embed);
			}
			const msg = await message.util?.send(embed);
			if (!msg) return message;
			const ownReaction = await msg.react('🗑');
			let react;
			try {
				react = await msg.awaitReactions(
					(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
					{ max: 1, time: 10000, errors: ['time'] },
				);
			} catch (error) {
				if (message.guild) msg.reactions.removeAll();
				else ownReaction.users.remove();

				return message;
			}
			react.first()?.message.delete();

			return message;
		}
		let repository = repo.split('/')[1];
		if (!repository) return;
		[repository] = repository.split('#');
		const num = repo.split('#')[1];
		if (!num) return;
		const query = `
			{
				repository(owner: "${owner}", name: "${repository}") {
					name
					issueOrPullRequest(number: ${num}) {
						... on PullRequest {
							comments {
								totalCount
							}
							commits(last: 1) {
								nodes {
									commit {
										oid
									}
								}
							}
							author {
								avatarUrl
								login
								url
							}
							body
							labels(first: 10) {
								nodes {
									name
								}
							}
							merged
							number
							publishedAt
							state
							title
							url
						}
						... on Issue {
							comments {
								totalCount
							}
							author {
								avatarUrl
								login
								url
							}
							body
							labels(first: 10) {
								nodes {
									name
								}
							}
							number
							publishedAt
							state
							title
							url
						}
					}
				}
			}
		`;
		let body;
		try {
			const res = await fetch('https://api.github.com/graphql', {
				method: 'POST',
				headers: { Authorization: `Bearer ${GITHUB_API_KEY}` },
				body: JSON.stringify({ query }),
			});
			body = await res.json();
		} catch (error) {
			return message.util?.reply(MESSAGES.COMMANDS.GITHUB.SEARCH.FAILURE);
		}
		if (!body?.data?.repository) {
			return message.util?.reply(MESSAGES.COMMANDS.GITHUB.SEARCH.FAILURE);
		}
		const d = body.data.repository.issueOrPullRequest;
		const embed = new MessageEmbed()
			.setColor(d.merged ? 0x9c27b0 : d.state === 'OPEN' ? 0x43a047 : 0xef6c00)
			.setAuthor(d.author?.login ?? 'Unknown', d.author?.avatarUrl ?? '', d.author?.url ?? '')
			.setTitle(d.title)
			.setURL(d.url)
			.setDescription(`${d.body.substring(0, 500)} ...`)
			.addField('State', d.state, true)
			.addField('Comments', d.comments.totalCount, true)
			.addField('Repo & Number', `${body.data.repository.name}#${d.number}`, true)
			.addField('Type', d.commits ? 'PULL REQUEST' : 'ISSUE', true)
			.addField(
				'Labels',
				d.labels.nodes.length ? d.labels.nodes.map((node: { name: string }): string => node.name) : 'NO LABEL(S)',
				true,
			)
			.setThumbnail(d.author?.avatarUrl ?? '')
			.setTimestamp(new Date(d.publishedAt));
		if (d.commits) {
			embed.addField(
				'Install with',
				`\`npm i ${owner}/${repository}#${d.commits.nodes[0].commit.oid.substring(0, 12)}\``,
			);
		}

		if (
			!(message.channel as TextChannel)
				.permissionsFor(this.client.user ?? '')
				?.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES], false)
		) {
			return message.util?.send(embed);
		}
		const msg = await message.util?.send(embed);
		if (!msg) return message;
		const ownReaction = await msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user): boolean => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 10000, errors: ['time'] },
			);
		} catch (error) {
			if (message.guild) msg.reactions.removeAll();
			else ownReaction.users.remove();

			return message;
		}
		react.first()?.message.delete();

		return message;
	}
}
