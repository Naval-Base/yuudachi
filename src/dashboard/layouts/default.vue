<template>
	<div id="app">
		<header id="header" class="grid">
			<div class="header-logo">
				<nuxt-link to="/">Yukikaze</nuxt-link>
			</div>
			<div class="header-content">
				<a v-if="!auth" href="http://localhost:8000/discord">{{ username }}</a>
				<span v-else>{{ username }}</span>
			</div>
		</header>
		<Nuxt />
		<footer id="footer" class="grid half-width">
			<nuxt-link to="/">Yukikaze</nuxt-link>
		</footer>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component
export default class DefaultLayout extends Vue {
	@Getter
	public authenticated: any;

	@Getter
	public user: any;

	get auth() {
		return this.authenticated;
	}

	get username() {
		return this.user ? this.user.username : 'Login';
	}
}
</script>

<style lang="scss">
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	body {
		margin: 0;
		background: #000000;
		color: #ffffff;
		font-size: 1rem;
		line-height: 1;
		font-family: $family-primary;
	}

	#app {
		margin: 0 auto;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	#header {
		padding: 1rem 0;
		border-bottom: 2px solid #6fc6e2;

		.header-logo {
			margin-left: 2rem;
		}

		.header-content {
			margin-right: 2rem;
			text-align: right;
		}

		a {
			text-decoration: none;
			color: #ffffff;
		}
	}

	#footer {
		margin: 0 .5rem 0 .5rem;
		justify-items: center;

		a {
			text-decoration: none;
			color: #ffffff;
		}

		> * {
			grid-column: span 2;
		}
	}

	@media (min-width: 768px) {}

	@media (min-width: 992px) {}

	@media (min-width: 1200px) {}
</style>
