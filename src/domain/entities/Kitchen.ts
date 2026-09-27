import type { Position } from '../value-objects/Position';

export type KitchenState = 'waiting_for_cat'  | 'idle' | 'producing' | 'ready';

export interface Kitchen {
    id: string;
    name: string;
    appearanceId: string;
    
    state: KitchenState;
    
    position: Position;

    producingSpeed: number;
    producingAmount: number;
    producingRemainingMs: number | null;

    catId: string | null;
};