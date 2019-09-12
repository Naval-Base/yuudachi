import { ConnectionManager } from 'typeorm';
import { Case } from '../models/Cases';
import { Reminder } from '../models/Reminders';
import { RoleState } from '../models/RoleStates';
import { Setting } from '../models/Settings';
import { Tag } from '../models/Tags';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'yukikaze',
	type: 'postgres',
	url: process.env.DB,
	entities: [Setting, Tag, RoleState, Case, Reminder]
});

export default connectionManager;
