import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { MESSAGES, SETTINGS } from '../../util/constants';

const { GITHUB_API_KEY } = process.env;

export default class GitHubPROrIssueCommand extends Command {
	public constructor() {
		super('gh-issue-pr', {
			aliases: ['gh-issue-pr', 'issue-pr', 'gh-pr', 'gh-issue'],
			description: {
				content: MESSAGES.COMMANDS.GITHUB.ISSUE_PR.DESCRIPTION,
				usage: '<pr/issue>',
				examples: ['1', '24', '100'],
			},
			regex: /\b(g|djs|commando|guide|rpc|collection)#(\d+)/i,
			category: 'github',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'pr_issue',
					match: 'content',
					type: 'number',
				},
			],
		});
	}

	public async exec(message: Message, args: any) {
		if (!GITHUB_API_KEY) {
			return message.util!.reply(MESSAGES.COMMANDS.GITHUB.ISSUE_PR.NO_GITHUB_API_KEY);
		}
		let owner;
		let repo;
		if (args.match?.[1] === 'g' || !args.match) {
			const repository = this.client.settings.get(message.guild!, SETTINGS.GITHUB_REPO);
			if (!repository) return message.util!.reply(MESSAGES.COMMANDS.GITHUB.ISSUE_PR.NO_GITHUB_REPO);
			owner = repository.split('/')[0];
			repo = repository.split('/')[1];
		}
		if (args.match?.[1] !== 'g') {
			switch (args.match[1]) {
				case 'djs':
					owner = 'discordjs';
					repo = 'discord.js';
					break;
				case 'commando':
					owner = 'discordjs';
					repo = 'Commando';
					break;
				case 'guide':
					owner = 'discordjs';
					repo = 'guide';
					break;
				case 'rpc':
					owner = 'discordjs';
					repo = 'RPC';
					break;
				case 'collection':
					owner = 'discordjs';
					repo = 'collection';
					break;
				default:
					return message.util!.reply('No u.');
			}
		}
		const num = args.match?.[2] || args.pr_issue;
		const query = `
			{
				repository(owner: "${owner}", name: "${repo}") {
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
			return message.util!.reply(MESSAGES.COMMANDS.GITHUB.ISSUE_PR.FAILURE);
		}
		if (!body?.data?.repository?.issueOrPullRequest) {
			return message.util!.reply(MESSAGES.COMMANDS.GITHUB.ISSUE_PR.FAILURE);
		}
		const data = body.data.repository.issueOrPullRequest;
		const embed = new MessageEmbed()
			.setColor(data.merged ? 0x9c27b0 : data.state === 'OPEN' ? 0x43a047 : 0xef6c00)
			.setAuthor(
				data.author?.login ??  'Unknown',
				data.author?.avatarUrl ?? '',
				data.author?.url ?? '',
			)
			.setTitle(data.title)
			.setURL(data.url)
			.setDescription(`${data.body.substring(0, 500)} ...`)
			.addField('State', data.state, true)
			.addField('Comments', data.comments.totalCount, true)
			.addField('Repo & Number', `${body.data.repository.name}#${data.number}`, true)
			.addField('Type', data.commits ? 'PULL REQUEST' : 'ISSUE', true)
			.addField(
				'Labels',
				data.labels.nodes.length ? data.labels.nodes.map((node: { name: string }) => node.name) : 'NO LABEL(S)',
				true,
			)
			.setThumbnail(data.author?.avatarUrl ?? '')
			.setTimestamp(new Date(data.publishedAt));
		if (repo && !['guide'].includes(repo) && data.commits) {
			embed.addField('Install with', `\`npm i ${owner}/${repo}#${data.commits.nodes[0].commit.oid.substring(0, 12)}\``);
		}

		if (
			!(message.channel as TextChannel)
				.permissionsFor(message.guild!.me!)!
				.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES], false)
		) {
			return message.util!.send(embed);
		}
		const msg = await message.util!.send(embed);
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author!.id,
				{ max: 1, time: 10000, errors: ['time'] },
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first()!.message.delete();

		return message;
	}
}
