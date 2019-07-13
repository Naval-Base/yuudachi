<template>
	<div />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class LoadingComponent extends Vue {}
</script>

<style lang="scss" scoped>
	div {
		position: relative;
		height: 2rem;
		width: 2rem;
		border: 3px solid #3CEFFF;
		overflow: hidden;
		animation: spin 3s ease infinite;

		&::before {
			content: '';
			position: absolute;
			height: 2rem;
			width: 2rem;
			background: hsla(185, 100%, 62%, .75);
			transform-origin: center bottom;
			transform: scaleY(1);
			animation: fill 3s linear infinite;
		}
	}

	@keyframes spin {
		50%,
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes fill {
		25%,
		50% {
			transform: scaleY(0);
		}
		100% {
			transform: scaleY(1);
		}
	}
</style>
