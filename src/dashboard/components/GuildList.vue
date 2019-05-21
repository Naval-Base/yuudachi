<template>
	<div>
		<template v-if="auth">
			<h1 class="guild-heading">
				Manageable:
			</h1>
			<div v-for="guild in manageableGuilds" :key="guild.id" class="guild-list">
				<nuxt-link :to="`/guilds/${guild.id}`" @click.native="selectGuild(guild.id)">
					<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
					<div>{{ guild.name }}</div>
				</nuxt-link>
			</div>
			<h1 class="guild-heading">
				Non-manageable servers:
			</h1>
			<div v-for="guild in memberGuilds" :key="guild.id" class="guild-list">
				<nuxt-link :to="`/guilds/${guild.id}`" @click.native="selectGuild(guild.id)">
					<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
					<div>{{ guild.name }}</div>
				</nuxt-link>
			</div>
		</template>
		<h1 v-else>
			Not logged in.
		</h1>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import { Guild } from '~/store';

@Component({
	name: 'GuildList'
})
export default class GuildListComponent extends Vue {
	@Getter
	public authenticated: any;

	@Getter
	public guilds: any;

	@Action
	public selectGuild: any;

	guildManageable(guild: Guild) {
		return (guild.permissions & (1 << 5)) === 1 << 5;
	}

	get auth() {
		return this.authenticated;
	}

	get manageableGuilds() {
		return this.guilds.length ? this.guilds.filter((guild: Guild) => this.guildManageable(guild)) : [];
	}

	get memberGuilds() {
		return this.guilds.length ? this.guilds.filter((guild: Guild) => !this.guildManageable(guild)) : [];
	}
}
</script>

<style lang="scss" scoped>
	.guild-heading {
			grid-column: 1 / -1;
	}

	.guild-list {
		max-width: 128px;
		display: grid;

		a {
			text-decoration: none;
			color: #ffffff;
			margin: 0;
			padding: 0;
		}

		img {
			border-radius: 50%;
		}

		div {
			margin: 1rem .5rem;
		}
	}
</style>
