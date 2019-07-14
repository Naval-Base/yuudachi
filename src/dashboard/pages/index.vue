<template>
	<main id="main">
		<section id="section">
			<GuildList />
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component({
	components: {
		GuildList: () => import('../components/GuildList.vue')
	}
})
export default class IndexPage extends Vue {}
</script>

<style lang="scss" scoped>
	#main {
		background: #1A1A1D;
		color: #FFFFFF;
		text-align: center;
		margin-left: calc(100vw - 100%);
	}

	#section > * {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
		justify-items: center;
	}
</style>
