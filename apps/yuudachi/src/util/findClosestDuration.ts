const DurationLabel = {
	"1m": 60 * 1_000,
	"5m": 5 * 60 * 1_000,
	"10m": 10 * 60 * 1_000,
	"1h": 60 * 60 * 1_000,
	"3h": 3 * 60 * 60 * 1_000,
	"6h": 6 * 60 * 60 * 1_000,
	"12h": 12 * 60 * 60 * 1_000,
	"1d": 24 * 60 * 60 * 1_000,
	"2d": 2 * 24 * 60 * 60 * 1_000,
	"3d": 3 * 24 * 60 * 60 * 1_000,
	"7d": 7 * 24 * 60 * 60 * 1_000,
};

export function findClosestDuration(value: number): string {
	const keys = Object.keys(DurationLabel);
	const durations = Object.values(DurationLabel);

	const closest = durations.reduce((prev, curr) => {
		return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
	});

	return keys[durations.indexOf(closest)]!;
}
