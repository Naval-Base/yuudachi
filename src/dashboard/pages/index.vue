<template>
	<main id="main" class="half-width">
		<section id="section" class="grid">
			<h2>Test</h2>
			<p>some text here</p>
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
</style>
