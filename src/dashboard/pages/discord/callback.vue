<template>
	<main id="main" class="grid">
		<section id="section">
			Successfully authenticated.
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue, Mutation } from 'nuxt-property-decorator';
import { User, Guild } from '~/store';

interface DiscordResponse {
	user: User;
	guilds: Guild[];
}

@Component
export default class DiscordCallbackPage extends Vue {
	@Mutation
	public setAuth: any;

	@Mutation
	public setUser: any;

	@Mutation
	public setGuilds: any;

	async mounted() {
		let json;
		try {
			const res = await fetch(`${process.env.DISCORD_CALLBACK || `http://localhost:8000/discord/callback`}?code=${this.$route.query.code}`, { credentials: 'include' });
			json = await res.json() as DiscordResponse;
			this.setAuth(true);
			this.setUser({ user: json.user });
		} catch {}

		this.$router.push('/');
	}
}
</script>

<style lang="scss" scoped>
	#main {
		margin: 1rem .5rem;
		color: #FFFFFF;
	}

	#section {
		grid-column: span 2;
		text-align: center;
	}
</style>
