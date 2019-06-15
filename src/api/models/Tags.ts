import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ObjectType, ID, Field, Int } from 'type-graphql';

/* eslint-disable @typescript-eslint/explicit-member-accessibility */

@ObjectType()
@Entity('tags')
export class Tag {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Index()
	@Column({ type: 'bigint' })
	user!: string;

	@Field()
	@Index()
	@Column({ type: 'bigint' })
	guild!: string;

	@Field()
	@Index()
	@Column()
	name!: string;

	@Field(() => [String])
	@Column({ 'type': 'text', 'array': true, 'default': (): string => 'ARRAY[]::text[]' })
	aliases!: string[];

	@Field()
	@Column()
	content!: string;

	@Field()
	@Column({ 'default': false })
	hoisted!: boolean;

	@Field(() => Int)
	@Column({ 'default': 0 })
	uses!: number;

	@Field()
	@Column({ type: 'bigint', nullable: true })
	last_modified!: string;

	@Field(() => String)
	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	createdAt!: Date;

	@Field(() => String)
	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	updatedAt!: Date;
}
