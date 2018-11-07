import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reminders')
export class Reminder {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'bigint' })
	user!: string;

	@Column({ type: 'bigint', nullable: true })
	channel!: string;

	@Column({ nullable: true })
	reason!: string;

	@Column()
	trigger!: string;

	@Column({ type: 'timestamptz' })
	triggers_at!: Date;
}
