import { container } from 'tsyringe';
import API from '@yuudachi/api';
import { Context } from '../../interfaces/Context';

export default (_: any, __: any, { userId }: Context) => {
	const api = container.resolve(API);
	return api.guilds.getOAuth(userId);
};
