import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role_states')
@Index(['guild', 'user'], { unique: true })
export class RoleState {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Index()
	@Column({ type: 'bigint' })
	public guild!: string;

	@Index()
	@Column({ type: 'bigint' })
	public user!: string;

	@Column({ type: 'text', array: true, default: (): string => 'ARRAY[]::text[]' })
	public roles!: string[];
}
