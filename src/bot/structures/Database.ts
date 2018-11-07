import { ConnectionManager } from 'typeorm';
import { Settings } from '../models/Settings';
import { Tags } from '../models/Tags';
import { RoleStates } from '../models/RoleStates';
import { Cases } from '../models/Cases';
import { Reminders } from '../models/Reminders';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'haruna',
	type: 'postgres',
	url: process.env.DB,
	synchronize: true,
	entities: [Settings, Tags, RoleStates, Cases, Reminders]
});

export default connectionManager;
