import type { WorkstationStates, WorkstationType } from '../../configs/Workstation';
import type { ProductionTypes } from '../../configs/Production';
import type { Position } from '../../value-objects/Position';

export interface Workstation {
    id: string;
    name: string;
    state: WorkstationStates;
    appearanceId: string;
    position: Position;
    type: WorkstationType;

    assignedCatId: string | null;

    productionType: ProductionTypes;
    productionAmount: number;
    productionSpeed: number;
    productionDuration: number;
    productionRemaining: number | null;
}
