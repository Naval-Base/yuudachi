<template>
	<main id="main">
		<section id="section">
			<GuildList />
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import GuildList from '~/components/GuildList.vue';

@Component({
	name: 'Home',
	components: {
		GuildList
	}
})
export default class IndexPage extends Vue {}
</script>

<style lang="scss" scoped>
	#main {
		background: #000000;
		color: #ffffff;
		text-align: center;
	}

	#section {
		> * {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
			justify-items: center;
		}
	}
</style>
