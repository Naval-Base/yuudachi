<template>
	<main id="main" class="grid">
		<section id="section">
			<h1>Information about this guild</h1>
			<template v-if="guild">
				<img :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`">
				<h3>{{ guild.name }}</h3>
				<h5>({{ guild.id }})</h5>
				<template v-if="setting">
					<div class="settings">
						<form>
							<div>Normal Settings:</div>
							<label>Prefix:</label>
							<input type="text" name="prefix" :value="setting.prefix">
							<label>GitHub Repository:</label>
							<input type="text" name="githubRepository" :value="setting.githubRepository">
							<label>Default Docs:</label>
							<input type="text" name="defaultDocs" :value="setting.defaultDocs">
							<div>Moderation Settings:</div>
							<label>Moderation Feature:</label>
							<input type="checkbox" name="moderation" :checked="Boolean(setting.moderation)">
							<label>Mute Role:</label>
							<input type="text" name="muteRole" list="muteRole" :value="databaseRole(setting.muteRole) ? `@${databaseRole(setting.muteRole).name}` : ''">
							<datalist id="muteRole">
								<option v-for="role in roles" :key="role.id" :value="role.id">
									@{{ role.name }}
								</option>
							</datalist>
							<label>Mod Channel:</label>
							<input type="text" name="modLogChannel" list="modLogChannel" :value="databaseChannel(setting.modLogChannel) ? `#${databaseChannel(setting.modLogChannel).name}` : ''">
							<datalist id="modLogChannel">
								<option v-for="channel in channels" :key="channel.id" :value="channel.id">
									#{{ channel.name }}
								</option>
							</datalist>
							<label>Total Cases:</label>
							<input type="text" name="caseTotal" :value="setting.caseTotal">
							<label>Guild Logs Webhook:</label>
							<input type="text" name="guildLogs" :value="setting.guildLogs">
						</form>
					</div>
				</template>
				<template v-else>
					<div class="settings no-settings">
						<p>Not in this guild; No settings.</p>
					</div>
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

	public channels: any = null;

	public roles: any = null;

	public settings: any = null;

	async asyncData({ app }: { app: any }) {
		try {
			const { data } = await app.apolloProvider.defaultClient.query({
				query: gql`query guild($guild_id: String!) {
					guild(id: $guild_id) {
						channels {
							...on TextChannel {
								type
								id
								name
							}
						}
						roles {
							id
							name
						}
						settings {
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
					}
				}`,
				variables: {
					guild_id: app.context.route.params.id
				}
			});

			return {
				channels: data.guild.channels.filter((c: any) => c.__typename === 'TextChannel'),
				roles: data.guild.roles,
				settings: data.guild.settings
			};
		} catch {
			return {
				channels: null,
				roles: null,
				settings: null
			};
		}
	}

	get setting() {
		return this.settings;
	}

	get guild() {
		return this.selectedGuild || this.guilds.find(guild => guild.id === this.$route.params.id);
	}

	databaseChannel(id: string) {
		return this.channels.find((channel: any) => channel.id === id);
	}

	databaseRole(id: string) {
		return this.roles.find((role: any) => role.id === id);
	}
}
</script>

<style lang="scss" scoped>
	$family-primary: 'Nunito', 'Roboto', sans-serif;

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

		.settings {
			&.no-settings {
				text-align: center;
			}

			margin: 1rem;
			padding: .5rem 1rem .2rem 1rem;
			border-left: #FFFFFF 2px solid;
			border-right: #FFFFFF 2px solid;

			> form  {
				> div {
					&:nth-child(n+2) {
						margin-top: 1rem;
					}

					text-align: center;
					margin-bottom: 1rem;
					background: rgba(13, 13, 14, .5);
					padding: .5rem;
				}

				> input {
					background: rgba(48, 48, 51, .7);
					border: 1px transparent solid;
					color: #ffffff;
					font-size: 1rem;
					font-family: $family-primary;
					padding: 0;
					margin-top: .2rem;
					margin-bottom: .5rem;
					outline: 0;
					width: 100%;

					&:focus {
						border-bottom: 1px #ffffff solid;
					}
				}
			}
		}
	}
</style>
