import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { IPCUser } from '../gql/resolvers/User';
import { IPCGuild } from '../gql/resolvers/Guild';

@ObjectType()
@Entity('tags')
export class Tag {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	public id!: number;

	@Field(() => IPCUser, { nullable: true })
	@Index()
	@Column({ type: 'bigint' })
	public user!: string;

	@Field(() => IPCGuild)
	@Index()
	@Column({ type: 'bigint' })
	public guild!: string;

	@Field()
	@Index()
	@Column()
	public name!: string;

	@Field(() => [String])
	@Column({ 'type': 'text', 'array': true, 'default': (): string => 'ARRAY[]::text[]' })
	public aliases!: string[];

	@Field()
	@Column()
	public content!: string;

	@Field()
	@Column({ 'default': false })
	public hoisted!: boolean;

	@Field(() => Int)
	@Column({ 'default': 0 })
	public uses!: number;

	@Field(() => IPCUser, { nullable: true })
	@Column({ type: 'bigint', nullable: true })
	public last_modified!: string;

	@Field(() => GraphQLDateTime)
	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	public createdAt!: Date;

	@Field(() => GraphQLDateTime)
	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	public updatedAt!: Date;
}
