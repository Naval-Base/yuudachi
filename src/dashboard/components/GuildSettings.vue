<template>
	<div>
		<template v-if="setting">
			<div class="settings">
				<form>
					<div>Normal Settings:</div>
					<label for="prefixInput">Prefix:</label>
					<input id="prefixInput" v-model="setting.prefix" :class="{ changed: settingsChange.prefix }" type="text" name="prefix" @change="inputChange('prefix', $event)">
					<label for="githubRepositoryInput">GitHub Repository:</label>
					<input id="githubRepositoryInput" v-model="setting.githubRepository" :class="{ changed: settingsChange.githubRepository }" type="text" name="githubRepository" @change="inputChange('githubRepository', $event)">
					<label for="defaultDocsInput">Default Docs:</label>
					<input id="defaultDocsInput" v-model="setting.defaultDocs" :class="{ changed: settingsChange.defaultDocs }" type="text" name="defaultDocs" @change="inputChange('defaultDocs', $event)">
					<div>Moderation Settings:</div>
					<label for="moderationInput">Moderation Feature:</label>
					<input id="moderationInput" :checked="Boolean(setting.moderation)" type="checkbox" name="moderation">
					<label for="muteRoleInput">Mute Role:</label>
					<input id="muteRoleInput" v-model="setting.muteRole" list="muteRole" :class="{ changed: settingsChange.muteRole }" type="text" name="muteRole" @change="inputChange('muteRole', $event)">
					<datalist id="muteRole">
						<option v-for="role in roles" :key="role.id" :value="role.id">
							@{{ role.name }}
						</option>
					</datalist>
					<label for="modLogChannelInput">Mod Channel:</label>
					<input id="modLogChannelInput" v-model="setting.modLogChannel" :class="{ changed: settingsChange.modLogChannel }" type="text" name="modLogChannel" list="modLogChannel" @change="inputChange('modLogChannel', $event)">
					<datalist id="modLogChannel">
						<option v-for="channel in channels" :key="channel.id" :value="channel.id">
							#{{ channel.name }}
						</option>
					</datalist>
					<label for="caseTotalInput">Total Cases:</label>
					<input id="caseTotalInput" v-model="setting.caseTotal" :class="{ changed: settingsChange.caseTotal }" type="text" name="caseTotal" @change="inputChange('caseTotal', $event)">
					<label for="guildLogsInput">Guild Logs Webhook:</label>
					<input id="guildLogsInput" v-model="setting.guildLogs" :class="{ changed: settingsChange.guildLogs }" type="text" name="guildLogs" @change="inputChange('guildLogs', $event)">
				</form>
				<div id="inputSubmit">
					<button @click="reset">
						Submit
					</button>
					<button @click="reset">
						Reset
					</button>
				</div>
			</div>
		</template>
		<template v-else>
			<div class="settings no-settings">
				<p>Not in this guild; No settings.</p>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import gql from 'graphql-tag';

interface SettingsChange {
	[key: string]: boolean;
}

@Component
export default class GuildSettingsComponent extends Vue {
	public channels: any = null;

	public roles: any = null;

	public settings: any = null;

	public defaultSettings: any = null;

	public settingsChange: SettingsChange = {
		prefix: false,
		githubRepository: false,
		defaultDocs: false,
		muteRole: false,
		modLogChannel: false,
		caseTotal: false,
		guildLogs: false
	};

	async mounted() {
		try {
			// @ts-ignore
			const { data } = await this.$apollo.query({
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
					guild_id: this.$route.params.id
				}
			});

			this.channels = data.guild.channels.filter((c: any) => c.__typename === 'TextChannel');
			this.roles = data.guild.roles;
			this.settings = data.guild.settings;
			this.defaultSettings = { ...data.guild.settings };
		} catch {
			this.channels = null;
			this.roles = null;
			this.settings = null;
			this.defaultSettings = null;
		}
	}

	get setting() {
		return this.settings;
	}

	databaseChannel(id: string) {
		return this.channels.find((channel: any) => channel.id === id);
	}

	databaseRole(id: string) {
		return this.roles.find((role: any) => role.id === id);
	}

	inputChange(type: string) {
		if (this.settings[type] === this.defaultSettings[type]) this.settingsChange[type] = false;
		else this.settingsChange[type] = true;
	}

	reset() {
		this.settings = { ...this.defaultSettings };
		for (const [k] of Object.entries(this.settingsChange)) this.settingsChange[k] = false;
	}
}
</script>

<style lang="scss" scoped>
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	.settings {
		display: grid;
		justify-content: center;
		grid-template-columns: minmax(6rem, 55rem);

		&.no-settings {
			text-align: center;
		}

		> form  {
			margin: .5rem;
			padding: .5rem 1rem .2rem 1rem;
			border-left: #FFFFFF 2px solid;
			border-right: #FFFFFF 2px solid;

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
				color: #FFFFFF;
				font-size: 1rem;
				font-family: $family-primary;
				padding: 0;
				margin-top: .2rem;
				margin-bottom: .5rem;
				outline: 0;
				width: 100%;

				&:focus {
					border-bottom: 1px #FFFFFF solid;
				}

				&.changed {
					border-bottom: 1px #19B919 solid;
				}

				&[type='checkbox'] {
					cursor: pointer;
				}
			}
		}

		> #inputSubmit {
			display: grid;
			justify-content: center;
			grid-template-columns: minmax(4rem, 6rem) minmax(4rem, 6rem);
			grid-gap: 1rem;

			> button {
				background: rgba(13, 13, 14, .5);
				border: none;
				color: #FFFFFF;
				padding: 1rem;
				outline: none;
				cursor: pointer;
			}
		}
	}
</style>
