<template>
	<main id="main" class="half-width">
		<section id="section">
			<h1 class="guild-heading">Owner:</h1>
			<div class="guild-list" v-for="guild in ownedGuilds" :key="guild.id">
				<nuxt-link :to="`/guilds/${guild.id}`">
					<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
					<div>{{ guild.name }}</div>
				</nuxt-link>
			</div>
			<h1 class="guild-heading">Member:</h1>
			<div class="guild-list" v-for="guild in memberGuilds" :key="guild.id">
				<nuxt-link :to="`/guilds/${guild.id}`">
					<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
					<div>{{ guild.name }}</div>
				</nuxt-link>
			</div>
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { Guild } from '~/store';

@Component({
	name: 'Home'
})
export default class IndexPage extends Vue {
	@Getter
	public guilds: any;

	public message = 'World';

	get ownedGuilds() {
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		return this.guilds.length ? this.guilds.filter((guild: Guild) => guild.owner) : [];
	}

	get memberGuilds() {
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		return this.guilds.length ? this.guilds.filter((guild: Guild) => !guild.owner) : [];
	}
}
</script>

<style lang="scss" scoped>
	#main {
		margin: 1rem .5rem;
		background: #000000;
		color: #ffffff;
		text-align: center;
	}

	#section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		justify-items: center;

		.guild-heading {
			grid-column: 1 / -1;
		}
	}

	.guild-list {
		max-width: 128px;
		display: grid;
		align-items: center;

		a {
			text-decoration: none;
			color: #ffffff;
			margin: 0;
			padding: 0;
		}

		img {
			border-radius: 50%;
		}

		div {
			margin: 1rem .5rem;
		}
	}
</style>
