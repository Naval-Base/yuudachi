<template>
	<main id="main" class="grid">
		<section id="section">
			Successfully authenticated.
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';

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
			const res = await fetch(`http://localhost:8000/discord/callback?code=${this.$route.query.code}`, { credentials: 'include' });
			json = await res.json();
		} catch {}

		this.setAuth({ authenticated: true });
		this.setUser({ user: json.data });
		this.setGuilds({ guilds: json.guilds });
	}
}
</script>

<style lang="scss" scoped>
	#main {
		margin: 1rem .5rem;
		background: #ffffff;
		color: #000000;
	}

	#section {
		grid-column: span 2;
		text-align: center;
	}
</style>
