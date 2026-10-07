import type { GameState } from '../entities/GameState';
import type { Position } from '../value-objects/Position';

import { getRandomInt } from './helpers/helpers';

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

        const cat = state.cats.find(catItem => catItem.id === item.assignedCatId && catItem.state === 'idle' && catItem.restingTimeRemaining <= 0);

        return Boolean(
            cat
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
        x: getRandomInt(100, 190, Math.random),
        y: getRandomInt(400, 500, Math.random),
    };

    return {
        ...state,

        workstations: state.workstations.map(item => {
            return item.id === workstation.id
                ? {
                    ...item,
                    state: 'ready',
                    productionRemaining: null,
                }
                : item;
        }),

        cats: state.cats.map(item => {
            return item.id === catId
                ? {
                    ...item,
                    state: 'resting',
                    targetPosition: catTarget,
                    restingTimeRemaining: item.restingDuration,
                }
                : item;
        }),
    };
}

export function simulateWorkstationCycleStart(
    state: GameState
): GameState {
    const workstation = state.workstations.find(item => item.state === 'idle' && item.assignedCatId !== null);

    if (!workstation) {
        return state;
    }

    const cat = state.cats.find(item => item.id === workstation.assignedCatId && item.state === 'idle' && item.restingTimeRemaining <= 0);

    if (!cat) {
        return state;
    }

    const newCatState = 'moving';
    const newWorkstationState = 'waiting_for_cat';
    const newTargetPosition = {
        x: workstation.position.x,
        y: workstation.position.y
    };

    return {
        ...state,
        
        cats: state.cats.map(item => {
            return item.id === cat.id ? {...item, state: newCatState, targetPosition: newTargetPosition} : item
        }),

        workstations: state.workstations.map(item => {
            return item.id === workstation.id ? {...item, state: newWorkstationState} : item
        }),
    }
}
