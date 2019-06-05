import { ObjectType, Field } from 'type-graphql';

export interface RestrictRoles {
	embed?: string;
	emoji?: string;
	reaction?: string;
}

@ObjectType()
export class RestrictRoles implements RestrictRoles {
	@Field()
	public embed?: string;

	@Field()
	public emoji?: string;

	@Field()
	public reaction?: string;
}
