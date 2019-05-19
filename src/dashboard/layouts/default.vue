<template>
	<div id="app">
		<header id="header" class="grid">
			<div class="header-logo">
				Yukikaze
			</div>
			<div class="header-content">
				Test Header 2
			</div>
		</header>
		<Nuxt />
		<footer id="footer" class="grid half-width">
			<div>
				Test Footer
			</div>
			<div>
				Test Footer 2
			</div>
		</footer>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class DefaultLayout extends Vue {}
</script>

<style lang="scss">
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	body {
		margin: 0;
		background: #000000;
		color: #ffffff;
		font-size: 1.1rem;
		line-height: 1.5;
		font-family: $family-primary;
	}

	#app {
		margin: 0 auto;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.half-width {
		max-width: 400px;
		margin: 0 auto;
	}

	#header {
		padding: 1rem 0;
		border-bottom: 2px solid #6fc6e2;
	}

	.header-logo {
		margin-left: 2rem;
	}

	@media (min-width: 768px) {
		#app {}

		.half-width {
			max-width: 600px;
			margin: 0 auto;
		}

		.grid {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr;
		}
	}

	@media (min-width: 992px) {
		#app {}

		.half-width {
			max-width: 800px;
			margin: 0 auto;
		}
	}

	@media (min-width: 1200px) {}
</style>
