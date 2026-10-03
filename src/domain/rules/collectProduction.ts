import type { GameState } from '../entities/GameState';
import type { WorkstationType } from '../configs/Workstation';
import { workstationCollections } from '../configs/Workstation'

export type ColletProductionResult =
    | {
            ok: true;
            state: GameState;
    } 
    | {
        ok: false;
        error: 'OBJECT_NOT_FOUND' | 'OBJECT_NOT_READY' | 'WRONG_PRODUCTION_TYPE';
    };

export function collectProduction(
    state: GameState,
    workstationType: WorkstationType,
    workstationId: String,
): ColletProductionResult {
    const collectionName = workstationCollections[workstationType];
    const workstation = state[collectionName].find(item => item.id === workstationId);

    if (!workstation) {
        return {
            ok: false,
            error: 'OBJECT_NOT_FOUND'
        }
    }

    if (workstation.state !== 'ready') {
        return {
            ok: false,
            error: 'OBJECT_NOT_READY'
        }
    }

    const productionType = workstation.productionType;
    const inventoryAmount = state.inventory.items[productionType];

    if (inventoryAmount !== undefined) {
        let newInventoryAmount = inventoryAmount;
        newInventoryAmount++;

        return {
            ok: true,
            state: {
                ...state,
                inventory: {
                    ...state.inventory, 
                    items: {
                        ...state.inventory.items,
                        [productionType]: newInventoryAmount,
                    }
                }
            }
        }
    }

    return {
        ok: false,
        error: 'WRONG_PRODUCTION_TYPE',
    }
}