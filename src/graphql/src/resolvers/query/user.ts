import { container } from 'tsyringe';
import API from '@yuudachi/api';

export default (_: any, args: { user_id: `${bigint}` }) => {
	const api = container.resolve(API);
	return api.users.getUser(args.user_id);
};
