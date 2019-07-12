<template>
	<div>
		<template v-if="tags">
			<div class="tags">
				<div v-for="(tag, index) in tags" :key="index" class="card">
					<div class="card-header">
						{{ tag.name }}
					</div>
					<div class="card-content">
						Aliases: {{ tag.aliases.length ? tag.aliases.join(', ') : 'No aliases' }}
					</div>
					<div class="card-content">
						Hoisted: {{ tag.hoisted }}
					</div>
					<div class="card-content">
						Uses: {{ tag.uses }}
					</div>
					<div class="card-footer">
						<span>
							{{ tag.user ? tag.user.tag : 'Unknown' }}
						</span>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<div class="tags no-tags">
				<pre>{{ message }}</pre>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Getter } from 'nuxt-property-decorator';
import gql from 'graphql-tag';

@Component
export default class GuildTagsComponent extends Vue {
	@Getter
	public selectedGuild!: any;

	public tags: string[] | null = null;

	public message: string = 'Loading...';

	get guild() {
		return this.selectedGuild;
	}

	async mounted() {
		try {
			// @ts-ignore
			const { data } = await this.$apollo.query({
				query: gql`query guild_tags($guild_id: String!) {
					guild(id: $guild_id) {
						tags {
							id
							user {
								id
								tag
							}
							name
							aliases
							content
							hoisted
							uses
							last_modified {
								id
								tag
							}
							createdAt
							updatedAt
						}
					}
				}`,
				variables: {
					guild_id: this.guild ? this.guild.id : this.$route.params.id
				}
			});

			this.tags = data.guild.tags;
		} catch {
			this.tags = null;
			this.message = 'Not in this guild || No tags.';
		}
	}
}
</script>

<style lang="scss" scoped>
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	.tags {
		display: grid;
		justify-content: center;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 20rem));
		padding: .5rem 1rem .2rem 1rem;

		&.no-tags {
			text-align: center;

			> pre {
				grid-column: span 8;
			}
		}

		.heading {
			margin-bottom: 1rem;
			background: rgba(13, 13, 14, .5);
			padding: .5rem;
		}

		.center {
			text-align: center;
		}

		> .card {
			display: grid;
			background: rgba(13, 13, 14, .5);
			word-wrap: break-word;
			word-break: break-all;
			margin: .5rem;
			padding: 0 .5rem;

			> .card-header {
				font-weight: 600;
				text-align: center;
				margin: 1rem;
			}

			> .card-content {
				padding: .3rem 1rem;
			}

			> .card-footer {
				font-size: .8rem;
				padding: .5rem;
				align-self: end;
				justify-self: end;
			}
		}
	}
</style>
