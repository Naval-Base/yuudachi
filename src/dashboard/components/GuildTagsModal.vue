<template>
	<div class="modal-background" @click.prevent="hideModal">
		<div class="modal" @click.prevent.stop="() => false">
			<div class="modal-header">
				{{ tag.name }}
			</div>
			<div class="modal-content">
				<span v-html="md(tag.content)" />
			</div>
			<div id="inputSubmit">
				<button :disabled="moderator" @click="post">
					Submit
				</button>
				<button :disabled="moderator" @click="post">
					Reset
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Getter, Action } from 'nuxt-property-decorator';
import gql from 'graphql-tag';
const discordMarkdown = require('discord-markdown'); // eslint-disable-line

@Component
export default class GuildTagsComponent extends Vue {
	@Getter
	public selectedGuild!: any;

	@Getter
	public selectedTag!: any;

	@Getter
	public tagModal!: any;

	@Action
	public showTagModal!: any;

	public md = discordMarkdown.toHTML;

	public tag: any = {
		id: 'Loading...',
		user: {
			id: 'Loading...',
			tag: 'Loading...'
		},
		name: 'Loading...',
		content: 'Loading...'
	};

	public message: string = 'Loading...';

	async mounted() {
		document.body.classList.add('no-scroll');

		try {
			// @ts-ignore
			const { data } = await this.$apollo.query({
				query: gql`query tag($id: Int!) {
					tag(id: $id) {
						id
						user {
							id
							tag
						}
						name
						content
					}
				}`,
				variables: {
					id: parseInt(this.selectedTag, 10)
				}
			});

			this.tag = data.tag;
		} catch {
			this.tag = null;
		}

		if (!this.tag) this.message = 'Not in this guild || No tags.';
	}

	beforeDestroy() {
		document.body.classList.remove('no-scroll');
	}

	hideModal() {
		this.showTagModal(!this.tagModal);
	}

	post() {
		if (true) {
			console.error('no can do');
		}
		console.log('yes can do');
	}
}
</script>

<style lang="scss" scoped>
	$family-primary: 'Nunito', 'Roboto', sans-serif;

	.modal-background {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 20rem));
		justify-items: center;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.75);
		position: fixed;

		> .modal {
			display: grid;
			grid-column: 1 / -1;
			min-width: 18rem;
			background: rgba(13, 13, 14, 1);
			word-wrap: break-word;
			word-break: break-all;
			padding: .3rem .5rem 1rem .3rem;

			> .modal-header {
				font-weight: 600;
				text-align: center;
				margin: 1rem;
			}

			> .modal-content {
				padding: .3rem 1rem;
			}

			> .modal-footer {
				font-size: .8rem;
				padding: .5rem;
				align-self: end;
				justify-self: end;
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

					/* &:disabled {
						opacity: .5;
						pointer-events: none;
					} */
				}
			}
		}
	}
</style>
