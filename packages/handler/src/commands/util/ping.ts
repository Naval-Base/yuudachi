import { injectable } from 'tsyringe';
import Rest from '@spectacles/rest';
import { Message } from '@spectacles/types';

import Command from '../../Command';

@injectable()
export default class implements Command {
	public constructor(public readonly rest: Rest) {}

	public async execute(message: Message) {
		const msg: Message = await this.rest.post(`/channels/${message.channel_id}/messages`, { content: 'Pinging...' });
		void this.rest.patch(`/channels/${message.channel_id}/messages/${msg.id}`, {
			content: `Don't think this means anything special! \`${
				Date.parse(msg.edited_timestamp ?? msg.timestamp) - Date.parse(message.edited_timestamp ?? message.timestamp)
			}ms\``,
		});
	}
}
