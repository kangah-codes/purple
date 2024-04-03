/**
 * @description Function to determine the intensity of a value based on an array of colours (for a heatmap)
 * @param {number} value the value to determine
 * @param {number} min minimum value in the values array
 * @param {number} max maximum value in the values array
 * @param {number} colorCount number of total colours representing the heatmap
 * @returns
 */
export function getColorIndex(value: number, min: number, max: number, colorCount: number): number {
    const scale = (value - min) / (max - min); // normalize value to 0-1
    const index = Math.round(scale * (colorCount - 1)); // scale to 0-(colorCount-1)
    return index;
}
