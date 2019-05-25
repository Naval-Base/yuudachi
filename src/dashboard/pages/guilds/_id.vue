<template>
	<main id="main" class="grid">
		<section id="section">
			<p>Information about the guild.</p>
			<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
			<p>{{ guild.name }}</p>
			<p>{{ guild.id }}</p>
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue, Getter } from 'nuxt-property-decorator';

@Component
export default class GuildPage extends Vue {
	@Getter
	public selectedGuild!: string;

	get guild() {
		return this.selectedGuild;
	}
}
</script>

<style lang="scss" scoped>
	#main {
		margin: 1rem .5rem;
		background: #FFFFFF;
		color: #000000;
	}

	#section {
		grid-column: span 2;
		text-align: center;

		img {
			border-radius: 50%;
		}
	}
</style>
