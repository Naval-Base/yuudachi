import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tags {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ type: 'bigint' })
	user!: string;
	@Column({ type: 'bigint' })
	guild!: string;
	@Column()
	name!: string;
	@Column({ array: true })
	aliases!: string[];
	@Column()
	content!: string;
	@Column()
	hoisted!: boolean;
	@Column()
	uses!: number;
	@Column({ type: 'bigint' })
	last_modified!: string;
}
