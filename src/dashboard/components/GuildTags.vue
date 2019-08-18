<template>
	<div>
		<template v-if="tags">
			<div class="tags">
				<div v-for="tag in tags" :key="tag.id" class="card" @click="openTag(tag.id)">
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
		<template v-else-if="loading">
			<div class="loading">
				<Loading />
				<pre>{{ message }}</pre>
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
import { Component, Vue, Getter, Action } from 'nuxt-property-decorator';
import gql from 'graphql-tag';

@Component({
	components: {
		Loading: () => import('./Loading.vue')
	}
})
export default class GuildTagsComponent extends Vue {
	@Getter
	public user!: any;

	@Getter
	public selectedGuild!: any;

	@Action
	public selectTag!: any;

	@Action
	public showTagModal!: any;

	public tags: string[] | null = null;

	public message = 'Loading...';

	public loading = true;

	public async mounted() {
		try {
			// @ts-ignore
			const { data } = await this.$apollo.query({
				query: gql`query guild_tags($guild_id: String!, $member_id: String!) {
					guild(id: $guild_id) {
						member(id: $member_id) {
							roles {
								id
								name
							}
						}
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
						settings {
							modRole
						}
					}
				}`,
				variables: {
					guild_id: this.guild ? this.guild.id : this.$route.params.id,
					member_id: this.user.id
				}
			});

			this.tags = data.guild.tags;
			if (!this.tags) this.loading = false;
		} catch {
			this.tags = null;
			this.loading = false;
		}

		if (!this.tags || !this.tags.length) this.message = 'Not in this guild || No tags.';
		if (this.tags && this.tags!.length) this.loading = false;
	}

	public beforeDestroy() {
		this.showTagModal(false);
	}

	public get guild() {
		return this.selectedGuild;
	}

	public openTag(id: number) {
		this.selectTag(id);
		this.showTagModal(true);
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
				grid-column: 1 / -1;
			}
		}

		> .card {
			display: grid;
			background: rgba(13, 13, 14, .5);
			word-wrap: break-word;
			word-break: break-all;
			margin: .5rem;
			padding: 0 .5rem;
			cursor: pointer;

			&:hover {
				box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, .7);
			}

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

	.loading {
		display: grid;
		justify-content: center;
		justify-items: center;
	}
</style>
