import { Structures } from 'discord.js';
import YukikazeClient from '../client/YukikazeClient';
import Queue from './Queue';

export default () =>
	Structures.extend('Guild', (Guild) => {
		return class YukikazeGuild extends Guild {
			public caseQueue = new Queue(this.client as YukikazeClient);
		};
	});
