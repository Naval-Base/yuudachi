<template>
	<main id="main" class="grid half-width">
		<section id="section">
			<p>Information about the guild.</p>
			<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
			<p>{{ guild.name }}</p>
			<p>{{ guild.id }}</p>
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component
export default class GuildPage extends Vue {
	@Getter
	public selectedGuild: any;

	get guild() {
		return this.selectedGuild;
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

		img {
			border-radius: 50%;
		}
	}
</style>
