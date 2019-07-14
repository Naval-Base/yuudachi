<template>
	<main id="main" class="grid">
		<section id="section">
			<h1>Information about this guild</h1>
			<template v-if="guild">
				<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
				<h3>{{ guild.name }}</h3>
				<h5>({{ guild.id }})</h5>
				<div class="tabs">
					<div class="tabs-topbar">
						<button :class="{ 'tab-button': true, active: activeTab === 'guildSettings' }" @click.prevent="switchTab('guildSettings')">
							Guild Settings
						</button>
						<button :class="{ 'tab-button': true, active: activeTab === 'guildTags' }" @click.prevent="switchTab('guildTags')">
							Guild Tags
						</button>
						<button :class="{ 'tab-button': true, active: activeTab === 'guildLogs' }" @click.prevent="switchTab('guildLogs')">
							Guild Logs
						</button>
					</div>
					<GuildSettings v-if="activeTab === 'guildSettings'" />
					<GuildTags v-if="activeTab === 'guildTags'" />
				</div>
			</template>
			<template v-else>
				<p>Loading...</p>
			</template>
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue, Getter, Action } from 'nuxt-property-decorator';
import { Guild } from '../../store';

@Component({
	components: {
		GuildSettings: () => import('../../components/GuildSettings.vue'),
		GuildTags: () => import('../../components/GuildTags.vue')
	},
	data() {
		return {
			activeTab: this.$route.query.tab || 'guildSettings'
		};
	}
})
export default class GuildPage extends Vue {
	@Getter
	public guilds!: Guild[];

	@Action
	public selectGuild!: any;

	@Action
	public selectTag!: any;

	public activeTab: string = 'guildSettings';

	beforeDestroy() {
		this.selectGuild({ id: null, settings: null });
		this.selectTag(null);
	}

	get guild() {
		return this.guilds.find(guild => guild.id === this.$route.params.id);
	}

	switchTab(key: string) {
		this.activeTab = key;
		this.$router.push({ query: Object.assign({}, this.$route.query, { tab: key }) });
	}
}
</script>

<style lang="scss" scoped>
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	#main {
		margin: 1rem .5rem;
		color: #FFFFFF;
		margin-left: calc(100vw - 100%);
	}

	#section {
		display: grid;
		grid-column: span 2;

		h1, h3, h5 {
			justify-self: center;
		}

		h1 {
			margin-top: 0;
		}

		h3, h5 {
			margin-top: 1rem;
			margin-bottom: .3rem;
		}

		h5 {
			font-weight: 400;
			margin-top: 0;
		}

		img {
			border-radius: 50%;
			justify-self: center;
		}

		.tabs {
			display: grid;

			> .tabs-topbar {
				display: grid;
				justify-items: center;
				justify-content: center;
				grid-template-columns: minmax(6rem, 10rem) minmax(6rem, 10rem) minmax(6rem, 10rem);
				margin: 1rem;

				> .tab-button {
					color: #FFFFFF;
					border: none;
					border-bottom: 1px transparent solid;
					background: none;
					outline: none;
					height: 45px;

					&.active {
						border-bottom: 1px #ffffff solid;
					}

					&:active {
						border-bottom: 1px #ffffff solid;
					}

					// TODO: remove, just for dev
					&:focus {
						border-bottom: 1px #ffffff solid;
					}
				}
			}
		}
	}
</style>
