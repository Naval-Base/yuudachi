import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tag {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'bigint' })
	user!: string;

	@Column({ type: 'bigint' })
	guild!: string;

	@Column()
	name!: string;

	@Column({ array: true, default: () => 'ARRAY[]::text[]' })
	aliases!: string;

	@Column()
	content!: string;

	@Column({ default: false })
	hoisted!: boolean;

	@Column({ default: 0 })
	uses!: number;

	@Column({ type: 'bigint', nullable: true })
	last_modified!: string;

	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt!: Date;

	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	updatedAt!: Date;
}
