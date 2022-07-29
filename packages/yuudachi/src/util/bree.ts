import Bree from 'bree';
import { container } from 'tsyringe';
import { kBree } from '../tokens.js';

export function createBree(): Bree {
	const bree = new Bree({ root: false, logger: false });
	container.register(kBree, { useValue: bree });

	return bree;
}
