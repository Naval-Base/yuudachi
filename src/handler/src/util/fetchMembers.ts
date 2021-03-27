import {
	APIInteraction,
	APIMessage,
	APIGuildMember,
	GatewayDispatchEvents,
	GatewayGuildMembersChunkDispatchData,
} from 'discord-api-types/v8';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import type { Amqp } from '@spectacles/brokers';

const { kGateway } = Tokens;

export function fetchMembers(message: APIMessage | APIInteraction): Promise<APIGuildMember[]> {
	const gatewayBroker = container.resolve<Amqp>(kGateway);

	return new Promise((resolve) => {
		const members: APIGuildMember[] = [];
		let idx = 0;
		const handler = (chunk: GatewayGuildMembersChunkDispatchData) => {
			idx++;
			for (const member of chunk.members) {
				if (member.user) {
					members.push(member);
				}
			}
			if (idx === chunk.chunk_count) {
				gatewayBroker.off(GatewayDispatchEvents.GuildMembersChunk, handler);
				return resolve(members);
			}
		};

		gatewayBroker.on(GatewayDispatchEvents.GuildMembersChunk, handler);
		gatewayBroker.publish('SEND', {
			guild_id: message.guild_id,
			packet: {
				op: 8,
				d: {
					guild_id: message.guild_id,
					query: '',
					limit: 0,
				},
			},
		});
	});
}
