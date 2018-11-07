import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role_states')
export class RoleState {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'bigint' })
	guild!: string;

	@Column({ type: 'bigint' })
	user!: string;

	@Column({ array: true, default: () => 'ARRAY[]::text[]' })
	roles!: string;
}
