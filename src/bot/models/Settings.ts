import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class Settings {
	@PrimaryColumn({ type: 'bigint' })
	guild!: string;
	@Column({ type: 'jsonb' })
	settings: any;
}
