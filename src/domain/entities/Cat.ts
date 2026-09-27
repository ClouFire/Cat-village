import type { Position } from '../value-objects/Position';

export type CatState = 'idle'  | 'moving' | 'resting' | 'cooking';

export interface Cat {
    id: string;
    name: string;
    appearanceId: string;
    
    state: CatState;
    
    position: Position;
    targetPosition: Position | null;

    movementSpeed: number;

    kitchenId: string | null;
};

