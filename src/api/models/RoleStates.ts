import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

/* eslint-disable @typescript-eslint/explicit-member-accessibility */

@Entity('role_states')
@Index(['guild', 'user'], { unique: true })
export class RoleState {
	@PrimaryGeneratedColumn()
	id!: number;

	@Index()
	@Column({ type: 'bigint' })
	guild!: string;

	@Index()
	@Column({ type: 'bigint' })
	user!: string;

	@Column({ 'type': 'text', 'array': true, 'default': (): string => 'ARRAY[]::text[]' })
	roles!: string[];
}
