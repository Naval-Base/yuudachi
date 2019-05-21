<template>
	<div id="app">
		<Header />
		<Nuxt />
		<Footer />
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component({
	components: {
		Header: () => import('~/components/Header.vue'),
		Footer: () => import('~/components/Footer.vue')
	}
})
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
		line-height: 1.2;
		font-family: $family-primary;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	@media (min-width: 768px) {}

	@media (min-width: 992px) {}

	@media (min-width: 1200px) {}
</style>
