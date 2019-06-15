declare module 'graphql-iso-date' {
	import { GraphQLScalarType } from 'graphql';

	export class GraphQLDate extends GraphQLScalarType {
		public name: 'Date';
	}

	export class GraphQLTime extends GraphQLScalarType {
		public name: 'Time';
	}

	export class GraphQLDateTime extends GraphQLScalarType {
		public name: 'DateTime';
	}
}
