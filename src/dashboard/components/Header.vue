<template>
	<header id="header" class="grid">
		<div class="header-logo">
			<nuxt-link to="/">
				Yukikaze
			</nuxt-link>
		</div>
		<div class="header-content">
			<a v-if="!auth" href="http://localhost:8000/discord">{{ username }}</a>
			<span v-else>{{ username }}</span>
		</div>
	</header>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component
export default class HeaderComponent extends Vue {
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

<style lang="scss" scoped>
	#header {
		padding: 1rem 0;
		border-bottom: 2px solid #6fc6e2;

		.header-logo {
			margin-left: 2rem;
		}

		.header-content {
			margin-right: 2rem;
			text-align: right;
		}

		a {
			text-decoration: none;
			color: #ffffff;
		}

		span {
			color: #ffffff;
		}
	}
</style>
