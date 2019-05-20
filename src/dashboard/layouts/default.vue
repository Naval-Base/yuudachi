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

import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';

@Component({
	components: {
		Header,
		Footer
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

	@media (min-width: 768px) {}

	@media (min-width: 992px) {}

	@media (min-width: 1200px) {}
</style>
