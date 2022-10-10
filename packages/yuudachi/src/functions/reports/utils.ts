export function reportRedisMessageKey(guildId: string, userId: string) {
	return `guild:${guildId}:report:messages:${userId}`;
}

export function reportRedisUserKey(guildId: string, userId: string) {
	return `guild:${guildId}:report:user:${userId}`;
}
