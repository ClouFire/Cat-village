import type { GameState } from '../entities/GameState';
import type { Position } from '../value-objects/Position';

export function simulateWorkstationProduction(
    state: GameState,
    elapsedMs: number,
): GameState {
    const workstation = state.workstations.find(
        item => item.state === 'producing',
    );

    if (!workstation) {
        return state;
    }

    const workstationId = workstation.id;
    const catId = workstation.assignedCatId;

    if (catId === null) {
        return state;
    }

    if (workstation.productionRemaining === null) {
        return state;
    }

    if (workstation.productionRemaining <= 0) {
        const nextProductionRemaining = null;
        const nextWorkstationState = 'ready';

        const nextCatState = 'resting';
        const nextCatTarget: Position = {
            x: getRandomInt(100, 190),
            y: getRandomInt(400, 500),
        };

        return {
            ...state,

            workstations: state.workstations.map(item => {
                return item.id === workstationId
                    ? {
                        ...item,
                        state: nextWorkstationState,
                        productionRemaining: nextProductionRemaining,
                    }
                    : item;
            }),

            cats: state.cats.map(item => {
                return item.id === catId
                    ? {
                        ...item,
                        state: nextCatState,
                        targetPosition: nextCatTarget,
                    }
                    : item;
            }),
        };
    }

    const nextProductionRemaining =
        workstation.productionRemaining -
        workstation.productionSpeed * elapsedMs;

    return {
        ...state,

        workstations: state.workstations.map(item => {
            return item.id === workstationId
                ? {
                    ...item,
                    productionRemaining: nextProductionRemaining,
                }
                : item;
        }),
    };
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(
        Math.random() * (max - min + 1),
    ) + min;
}