import { Token } from 'lexure';
import { Message } from '@spectacles/types';

export interface BrokerParserOutput {
	command: Token;
	arguments: Record<string, unknown>;
	tokens: Token[];
	message: Message;
}
