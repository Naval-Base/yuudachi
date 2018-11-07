import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cases')
export class Cases {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ type: 'bigint' })
	guild!: string;
	@Column({ type: 'bigint' })
	message!: string;
	@Column()
	case_id!: number;
	@Column()
	ref_id!: number;
	@Column({ type: 'bigint' })
	target_id!: string;
	@Column({ type: 'text' })
	target_tag!: string;
	@Column({ type: 'bigint' })
	mod_id!: string;
	@Column({ type: 'text' })
	mod_tag!: string;
	@Column()
	action!: number;
	@Column({ type: 'text' })
	reason!: string;
	@Column({ type: 'timestamptz' })
	action_duration!: Date;
	@Column()
	action_processed!: boolean;
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt!: Date;
}
