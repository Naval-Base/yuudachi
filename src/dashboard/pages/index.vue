<template>
	<main id="main" class="half-width">
		<section id="section" class="grid">
			<p>Hello {{ message }}!</p>
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
	name: 'Home'
})
export default class IndexPage extends Vue {
	public message = 'World';
}
</script>

<style lang="scss" scoped>
	#main {
		margin: 1rem .5rem;
		background: #ffffff;
		color: #000000;
		text-align: center;
	}

	#section {
		> * {
			grid-column: span 2;
		}
	}
</style>
