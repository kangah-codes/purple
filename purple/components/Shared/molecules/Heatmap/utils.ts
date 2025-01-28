/**
 * @description Function to determine the intensity of a value based on an array of colours (for a heatmap)
 * @param {number} value the value to determine
 * @param {number} min minimum value in the values array
 * @param {number} max maximum value in the values array
 * @param {number} colorCount number of total colours representing the heatmap
 * @returns
 */
export function getColorIndex(
    value: number,
    min: number,
    max: number,
    colorCount: number = 6,
    threshold: number = Infinity,
): number {
    // If value exceeds the threshold, clamp it to the threshold
    if (value > threshold) {
        value = threshold;
    }

    if (min === max) {
        return 0; // or handle this case as needed
    }

    // Apply logarithmic scaling (log(value + 1) to avoid log(0))
    const logValue = Math.log(value + 1); // Adding 1 avoids taking log of 0

    // Normalize the log value between 0 and 1
    const logMin = Math.log(min + 1);
    const logMax = Math.log(max + 1);
    const scale = (logValue - logMin) / (logMax - logMin);

    // Map the normalized value to the color index
    const index = Math.round(scale * (colorCount - 1));

    return index;
}
