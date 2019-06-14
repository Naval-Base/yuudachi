import { ObjectType, Field, ID, Int } from 'type-graphql';

export interface Role {
	guild: string;
	id: string;
	name: string;
	color: number;
	hoist: boolean;
	rawPosition: number;
	permissions: number;
	managed: boolean;
	mentionable: boolean;
	createdTimestamp: number;
}

@ObjectType()
export class Role implements Role {
	@Field(() => String)
	public guild!: string;

	@Field(() => ID)
	public id!: string;

	@Field(() => String)
	public name!: string;

	@Field(() => Int)
	public color!: number;

	@Field(() => Boolean)
	public hoist!: boolean;

	@Field(() => Int)
	public rawPosition!: number;

	@Field(() => Int)
	public permissions!: number;

	@Field(() => Boolean)
	public managed!: boolean;

	@Field(() => Boolean)
	public mentionable!: boolean;

	@Field(() => Int)
	public createdTimestamp!: number;
}
