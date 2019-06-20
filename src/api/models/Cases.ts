import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('cases')
export class Case {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Index()
	@Column({ type: 'bigint' })
	public guild!: string;

	@Column({ type: 'bigint', nullable: true })
	public message!: string;

	@Index()
	@Column()
	public case_id!: number;

	@Column({ nullable: true })
	public ref_id!: number;

	@Index()
	@Column({ type: 'bigint' })
	public target_id!: string;

	@Column({ type: 'text' })
	public target_tag!: string;

	@Column({ type: 'bigint', nullable: true })
	public mod_id!: string;

	@Column({ type: 'text', nullable: true })
	public mod_tag!: string;

	@Column()
	public action!: number;

	@Column({ type: 'text', nullable: true })
	public reason!: string;

	@Column({ type: 'timestamptz', nullable: true })
	public action_duration!: Date;

	@Index()
	@Column({ 'default': true })
	public action_processed!: boolean;

	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	public createdAt!: Date;
}
