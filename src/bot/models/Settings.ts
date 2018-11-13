import { Entity, Column, PrimaryColumn } from 'typeorm';

/* tslint:disable:member-access */

@Entity('settings')
export class Setting {
	@PrimaryColumn({ type: 'bigint' })
	guild!: string;

	@Column({ type: 'jsonb', default: () => "'{}'" })
	settings: any;
}
