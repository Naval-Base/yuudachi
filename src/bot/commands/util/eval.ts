import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import * as util from 'util';
import { stripIndents } from 'common-tags';

const NL = '!!NL!!';
const NL_PATTERN = new RegExp(NL, 'g');

export default class EvalCommand extends Command {
	public hrStart: [number, number] | undefined;

	public lastResult: any = null;

	private _sensitivePattern!: any;

	public constructor() {
		super('eval', {
			aliases: ['eval'],
			description: {
				content: 'Prohibit/Allow a user from using Yukikaze.',
				usage: '<code>'
			},
			category: 'util',
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'code',
					match: 'content',
					type: 'string',
					prompt: {
						start: (message: Message) => `${message.author}, what would you like to evaluate?`
					}
				}
			]
		});
	}

	public exec(message: Message, { code }: { code: string }) {
		/* eslint-disable no-unused-vars */
		const msg = message;
		const { client, lastResult } = this;
		const doReply = (val: any) => {
			if (val instanceof Error) {
				message.util!.send(`Callback error: \`${val}\``);
			} else {
				const result = this.result(val, process.hrtime(this.hrStart));
				if (Array.isArray(result)) {
					for (const res of result) message.util!.send(res);
				}

				message.util!.send(result);
			}
		};
		/* eslint-enable no-unused-vars */

		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(code); // eslint-disable-line no-eval
			hrDiff = process.hrtime(hrStart);
		} catch (error) {
			return message.util!.send(`Error while evaluating: \`${error}\``);
		}

		this.hrStart = process.hrtime();
		const result = this.result(this.lastResult, hrDiff, code);
		if (Array.isArray(result)) return result.map(res => message.util!.send(res));
		return message.util!.send(result);
	}

	result(result: any, hrDiff: [number, number], input: string | null = null) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(NL_PATTERN, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ? split[split.length - 1] : inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if (input) {
			return Util.splitMessage(stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}

		return Util.splitMessage(stripIndents`
			*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
			\`\`\`javascript
			${inspected}
			\`\`\`
		`, { maxLength: 1900, prepend, append });
	}

	get sensitivePattern() {
		if (!this._sensitivePattern) {
			const token = this.client.token.split('').join('[^]{0,2}');
			const revToken = this.client.token.split('').reverse().join('[^]{0,2}');
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(`${token}|${revToken}`, 'g') });
		}
		return this._sensitivePattern;
	}
}
