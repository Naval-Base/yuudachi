import { vi } from "vitest";

export const translateMock = vi.fn((key: string, opts?: { lng?: string }) => `${key}:${opts?.lng ?? ""}`);

export const mockCreateButton = vi.fn<(input: unknown) => unknown>();
export const mockAddFields = vi.fn((...parts: Record<string, unknown>[]) => Object.assign({}, ...parts));
export const mockTruncate = vi.fn((value: string, max: number, suffix = "...") =>
	value.length > max ? `${value.slice(0, max)}${suffix}` : value,
);
export const mockTruncateEmbed = vi.fn(<T>(embed: T) => embed);
export const mockContainerGet = vi.fn<(token: unknown) => unknown>();
export const mockContainerBind = vi.fn<(binding: { provide: unknown; useValue: unknown }) => void>();
export const mockLogger = {
	warn: vi.fn<(message: unknown, extra?: string) => void>(),
	info: vi.fn<(message: unknown) => void>(),
	error: vi.fn<(error: unknown, message?: string) => void>(),
};
export const mockEllipsis = (value: string, max: number) => (value.length > max ? value.slice(0, max) : value);

export type SqlMock<T> = ReturnType<typeof vi.fn<(strings?: TemplateStringsArray) => Promise<T[]> | T[]>> & {
	unsafe: ReturnType<typeof vi.fn<(query: string, params?: unknown[]) => Promise<{ value: unknown }[]>>>;
};

export function createSqlMock<T = unknown>(
	handler: (strings?: TemplateStringsArray) => Promise<T[]> | T[] = async () => [],
	unsafeResult: unknown = null,
): SqlMock<T> {
	const sqlMock = vi.fn(handler) as SqlMock<T>;
	sqlMock.unsafe = vi.fn(async () => [{ value: unsafeResult }]);
	return sqlMock;
}

export const kSQL = Symbol("kSQL");
export const kWebhooks = Symbol("kWebhooks");
export const kRedis = Symbol("kRedis");
