import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('tags')
export class Tag {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Index()
	@Column({ type: 'bigint' })
	public user!: string;

	@Index()
	@Column({ type: 'bigint' })
	public guild!: string;

	@Index()
	@Column()
	public name!: string;

	@Column({ 'type': 'text', 'array': true, 'default': (): string => 'ARRAY[]::text[]' })
	public aliases!: string[];

	@Column()
	public content!: string;

	@Column({ 'default': false })
	public hoisted!: boolean;

	@Column({ 'default': 0 })
	public uses!: number;

	@Column({ type: 'bigint', nullable: true })
	public last_modified!: string;

	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	public createdAt!: Date;

	@Column({ 'type': 'timestamptz', 'default': (): string => 'now()' })
	public updatedAt!: Date;
}
