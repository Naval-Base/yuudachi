<template>
	<footer id="footer" class="grid">
		<nuxt-link to="/">
			Yukikaze
		</nuxt-link>
	</footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class FooterComponent extends Vue {}
</script>

<style lang="scss" scoped>
	#footer {
		margin: 0 .5rem 0 .5rem;
		justify-items: center;

		a {
			text-decoration: none;
			color: #FFFFFF;
		}

		> * {
			grid-column: span 2;
		}
	}
</style>
