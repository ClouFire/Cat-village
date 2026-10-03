import type { Position } from '../../../value-objects/Position';
import type { Workstation } from '../Workstation';

export type KitchenState = 'waiting_for_cat'  | 'idle' | 'producing' | 'ready';

export interface Kitchen extends Workstation {
    id: string;
    name: string;
    state: KitchenState;
    appearanceId: string;
    position: Position;

    catId: string | null;

    productionSpeed: number;
    productionAmount: number;
    productionDuration: number;
    productionRemaining: number | null;
};