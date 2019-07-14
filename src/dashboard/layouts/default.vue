<template>
	<div id="app">
		<GuildTagsModal v-if="showModal" />
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
		Header: () => import('../components/Header.vue'),
		Footer: () => import('../components/Footer.vue'),
		GuildTagsModal: () => import('../components/GuildTagsModal.vue')
	}
})
export default class DefaultLayout extends Vue {
	@Getter
	public authenticated!: boolean;

	@Getter
	public user!: any;

	@Getter
	public tagModal!: boolean;

	get auth() {
		return this.authenticated;
	}

	get username() {
		return this.user ? this.user.username : 'Login';
	}

	get showModal() {
		return this.tagModal;
	}
}
</script>

<style lang="scss">
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	body {
		margin: 0;
		background: #1A1A1D;
		color: #FFFFFF;
		font-size: 1rem;
		line-height: 1.2;
		font-family: $family-primary;
	}

	a {
		text-decoration: none;
		color: #6FC6E2;

		&:hover {
			text-decoration: underline;
		}
	}

	.no-scroll {
		overflow: hidden;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	@media (min-width: 768px) {}

	@media (min-width: 992px) {}

	@media (min-width: 1200px) {}
</style>
