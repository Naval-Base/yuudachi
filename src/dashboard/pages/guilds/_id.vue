<template>
	<main id="main" class="grid">
		<section id="section">
			<h1>Information about the guild.</h1>
			<template v-if="guild">
				<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
				<h3>{{ guild.name }}</h3>
				<h5>({{ guild.id }})</h5>
				<template v-if="setting">
					<div id="settings">
						<p>Prefix: {{ setting.prefix }}</p>
						<p>Moderation: {{ setting.moderation }}</p>
						<p>Mute role: {{ setting.muteRole }}</p>
						<p>Mod channel: {{ setting.modLogChannel }}</p>
						<p>Total cases: {{ setting.caseTotal }}</p>
						<p>Guild logs channel: {{ setting.guildLogs }}</p>
						<p>GitHub repository: {{ setting.githubRepository }}</p>
						<p>Default docs: {{ setting.defaultDocs }}</p>
					</div>
				</template>
				<template v-else>
					<p>Not in this guild; No settings.</p>
				</template>
			</template>
			<template v-else>
				<p>Loading...</p>
			</template>
		</section>
	</main>
</template>

<script lang="ts">
import { Component, Vue, Getter } from 'nuxt-property-decorator';
import { Guild } from '../../store';
import gql from 'graphql-tag';

@Component
export default class GuildPage extends Vue {
	@Getter
	public guilds!: Guild[];

	@Getter
	public selectedGuild!: string;

	public settings: any = null;

	async asyncData({ app }: { app: any }) {
		try {
			const { data } = await app.apolloProvider.defaultClient.query({
				query: gql`query setting($id: String!) {
					setting(id: $id) {
						prefix
						moderation
						muteRole
						restrictRoles {
							embed
							reaction
							emoji
						}
						modRole
						modLogChannel
						caseTotal
						guildLogs
						githubRepository
						defaultDocs
					}
				}`,
				variables: {
					id: app.context.route.params.id
				}
			});

			return {
				settings: data.setting
			};
		} catch {
			return {
				settings: null
			}
		}
	}

	get setting() {
		return this.settings;
	}

	get guild() {
		return this.selectedGuild || this.guilds.find(guild => guild.id === this.$route.params.id);
	}
}
</script>

<style lang="scss" scoped>
	#main {
		margin: 1rem .5rem;
		color: #FFFFFF;
	}

	#section {
		display: grid;
		grid-column: span 2;

		h1, h3, h5 {
			justify-self: center;
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

		#settings {
			margin-top: 1rem;
			margin-left: 1.5rem;
			padding-left: 1rem;
			border-left: #FFFFFF 2px solid;
		}
	}
</style>
