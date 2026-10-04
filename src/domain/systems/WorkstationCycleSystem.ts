import type { GameState } from '../entities/GameState';
import type { Position } from '../value-objects/Position';

function isSamePosition(
    first: Position,
    second: Position,
): boolean {
    return first.x === second.x && first.y === second.y;
}

export function simulateAssignedWorkstations(
    state: GameState,
): GameState {
    const workstation = state.workstations.find(item => {
        if (item.state !== 'idle' || item.assignedCatId === null) {
            return false;
        }

        const cat = state.cats.find(catItem => catItem.id === item.assignedCatId);

        return Boolean(
            cat
            && cat.state === 'idle'
            && cat.workstationId === item.id,
        );
    });

    if (!workstation || workstation.assignedCatId === null) {
        return state;
    }

    const catId = workstation.assignedCatId;

    return {
        ...state,

        cats: state.cats.map(item => {
            return item.id === catId
                ? {
                    ...item,
                    state: 'moving',
                    targetPosition: {
                        ...workstation.position,
                    },
                }
                : item;
        }),

        workstations: state.workstations.map(item => {
            return item.id === workstation.id
                ? {
                    ...item,
                    state: 'waiting_for_cat',
                }
                : item;
        }),
    };
}

export function simulateWorkstationArrival(
    state: GameState,
): GameState {
    const workstation = state.workstations.find(item => {
        if (item.state !== 'waiting_for_cat' || item.assignedCatId === null) {
            return false;
        }

        const cat = state.cats.find(catItem => catItem.id === item.assignedCatId);

        return Boolean(
            cat
            && cat.state === 'idle'
            && cat.targetPosition === null
            && isSamePosition(cat.position, item.position),
        );
    });

    if (!workstation || workstation.assignedCatId === null) {
        return state;
    }

    const catId = workstation.assignedCatId;

    return {
        ...state,

        cats: state.cats.map(item => {
            return item.id === catId
                ? {
                    ...item,
                    state: 'cooking',
                    workstationId: workstation.id,
                }
                : item;
        }),

        workstations: state.workstations.map(item => {
            return item.id === workstation.id
                ? {
                    ...item,
                    state: 'producing',
                    productionRemaining: item.productionDuration,
                }
                : item;
        }),
    };
}

export function simulateWorkstationProduction(
    state: GameState,
    elapsedMs: number,
): GameState {
    const workstation = state.workstations.find(item => {
        return item.state === 'producing';
    });

    if (!workstation || workstation.assignedCatId === null) {
        return state;
    }

    if (workstation.productionRemaining === null) {
        return state;
    }

    const nextProductionRemaining = workstation.productionRemaining - elapsedMs;

    if (nextProductionRemaining > 0) {
        return {
            ...state,

            workstations: state.workstations.map(item => {
                return item.id === workstation.id
                    ? {
                        ...item,
                        productionRemaining: nextProductionRemaining,
                    }
                    : item;
            }),
        };
    }

    const catId = workstation.assignedCatId;
    const catTarget: Position = {
        x: getRandomInt(100, 190),
        y: getRandomInt(400, 500),
    };

    return {
        ...state,

        workstations: state.workstations.map(item => {
            return item.id === workstation.id
                ? {
                    ...item,
                    state: 'ready',
                    productionRemaining: null,
                    assignedCatId: null,
                }
                : item;
        }),

        cats: state.cats.map(item => {
            return item.id === catId
                ? {
                    ...item,
                    state: 'moving',
                    targetPosition: catTarget,
                    workstationId: null,
                }
                : item;
        }),
    };
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
