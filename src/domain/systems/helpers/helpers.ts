export type RandomSource = () => number;

export function getRandomInt(
    min: number,
    max: number,
    random: RandomSource,
): number {
    return Math.floor(
        random() * (max - min + 1)
    ) + min;
}