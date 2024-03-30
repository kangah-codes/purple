export function getColorIndex(
	value: number,
	min: number,
	max: number,
	colorCount: number
): number {
	const scale = (value - min) / (max - min); // normalize value to 0-1
	const index = Math.round(scale * (colorCount - 1)); // scale to 0-(colorCount-1)
	return index;
}
