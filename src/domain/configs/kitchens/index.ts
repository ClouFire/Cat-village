import { level1 } from './level-1';
import { level2 } from './level-2';

export type LevelConfig = {
    appearanceId: string;
    productionSpeed: number;
    productionAmount: number;
    productionDuration: number;
    level: number;
};

export const configs: Record<number, LevelConfig> = {
    1: level1,
    2: level2
}