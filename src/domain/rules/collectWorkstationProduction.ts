import type { GameState } from '../entities/GameState';

export type CollectWorkstationProductionResult =
    | {
        ok: true;
        state: GameState;
    }
    | {
        ok: false;
        error:
            | 'WORKSTATION_NOT_FOUND'
            | 'WORKSTATION_NOT_READY'
            | 'WRONG_PRODUCTION_TYPE';
    };

export function collectWorkstationProduction(
    state: GameState,
    workstationId: string,
): CollectWorkstationProductionResult {
    const workstation = state.workstations.find(
        item => item.id === workstationId,
    );

    if (!workstation) {
        return {
            ok: false,
            error: 'WORKSTATION_NOT_FOUND',
        };
    }

    if (workstation.state !== 'ready') {
        return {
            ok: false,
            error: 'WORKSTATION_NOT_READY',
        };
    }

    const inventoryAmount = state.inventory.items[workstation.productionType];

    if (inventoryAmount === undefined) {
        return {
            ok: false,
            error: 'WRONG_PRODUCTION_TYPE',
        };
    }

    return {
        ok: true,
        state: {
            ...state,

            workstations: state.workstations.map(item => {
                return item.id === workstationId
                    ? {
                        ...item,
                        state: 'idle',
                        productionRemaining: null,
                    }
                    : item;
            }),

            inventory: {
                ...state.inventory,
                items: {
                    ...state.inventory.items,
                    [workstation.productionType]: inventoryAmount + workstation.productionAmount,
                },
            },
        },
    };
}
