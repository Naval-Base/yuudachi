<template>
	<main id="main" class="grid half-width">
		<section id="section">
			Information about the guild.
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class GuildPage extends Vue {}
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
