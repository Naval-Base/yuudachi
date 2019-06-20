import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('reminders')
export class Reminder {
	@PrimaryGeneratedColumn('uuid')
	public id!: string;

	@Index()
	@Column({ type: 'bigint' })
	public user!: string;

	@Column({ type: 'bigint', nullable: true })
	public channel!: string;

	@Column({ nullable: true })
	public reason!: string;

	@Column()
	public trigger!: string;

	@Column({ type: 'timestamptz' })
	public triggers_at!: Date;
}
