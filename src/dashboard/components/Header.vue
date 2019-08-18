<template>
	<header id="header" class="grid">
		<nav class="grid">
			<div class="header-logo">
				<nuxt-link to="/">
					Yukikaze
				</nuxt-link>
			</div>
			<div class="header-content">
				<a v-if="!auth" :href="authURL">{{ username }}</a>
				<span v-else>{{ username }}</span>
			</div>
		</nav>
	</header>
</template>

<script lang="ts">
import { Component, Vue, Getter } from 'nuxt-property-decorator';

@Component
export default class HeaderComponent extends Vue {
	@Getter
	public authenticated!: boolean;

	@Getter
	public user!: any;

	public get auth() {
		return this.authenticated;
	}

	public get username() {
		return this.user ? this.user.username : 'Login';
	}

	public get authURL() {
		return process.env.DISCORD_CALLBACK || 'http://localhost:8000/discord';
	}
}
</script>

<style lang="scss" scoped>
	#header {
		padding: 1rem 0;
		border-bottom: 2px solid #6FC6E2;

		> nav {
			grid-column: span 2;
		}

		.header-logo {
			margin-left: 2rem;
		}

		.header-content {
			margin-right: 2rem;
			text-align: right;
		}

		a {
			text-decoration: none;
			color: #FFFFFF;
		}

		span {
			color: #FFFFFF;
		}
	}
</style>
