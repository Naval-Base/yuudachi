function cleanContent(message, str) {
	return str
		.replace(/<@!?[0-9]+>/g, input => {
			const id = input.replace(/<|!|>|@/g, '');
			if (message.channel.type === 'dm' || message.channel.type === 'group') {
				return message.client.users.has(id) ? `@${message.client.users.get(id).username}` : input;
			}

			const member = message.channel.guild.members.get(id);
			if (member) return `@${member.displayName}`;
			const user = message.client.users.get(id);
			if (user) return `@${user.username}`;
			return input;
		})
		.replace(/<#[0-9]+>/g, input => {
			const channel = message.client.channels.get(input.replace(/<|#|>/g, ''));
			if (channel) return `#${channel.name}`;
			return input;
		})
		.replace(/<@&[0-9]+>/g, input => {
			if (message.channel.type === 'dm' || message.channel.type === 'group') return input;
			const role = message.guild.roles.get(input.replace(/<|@|>|&/g, ''));
			if (role) return `@${role.name}`;
			return input;
		});
}

module.exports = {
	cleanContent
};
