import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class Setting {
	@PrimaryColumn({ type: 'bigint' })
	public guild!: string;

	@Column({ 'type': 'jsonb', 'default': (): string => "'{}'" })
	public settings!: any;
}
