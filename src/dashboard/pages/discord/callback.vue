<template>
	<main id="main" class="half-width">
		<section id="section" class="grid">
			{{ output }}
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';

@Component({
	name: 'Home'
})
export default class IndexPage extends Vue {
	public output = 'Loading...';

	@Mutation
	public setAuth: any;

	@Mutation
	public setUser: any;

	async mounted() {
		let json;
		try {
			const res = await fetch(`http://localhost:8000/discord/callback?code=${this.$route.query.code}`, { credentials: 'include' });
			json = await res.json();
		} catch {}

		this.setAuth({ authenticated: true });
		this.setUser({ user: json.data });
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
		text-align: center;

		> * {
			grid-column: span 2;
		}
	}
</style>
