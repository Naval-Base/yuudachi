import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reminders')
export class Reminders {
	@PrimaryGeneratedColumn('uuid')
	id!: string;
	@Column({ type: 'bigint' })
	user!: string;
	@Column({ type: 'bigint' })
	channel!: string;
	@Column()
	reason!: string;
	@Column()
	trigger!: string;
	@Column({ type: 'timestamptz' })
	triggers_at!: Date;
}
