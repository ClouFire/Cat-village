import type { GameState } from '../entities/GameState';

export type AssignCatToWorkstationErrorTypes =
    | 'CAT_NOT_FOUND'
    | 'WORKSTATION_NOT_FOUND'
    | 'CAT_IS_BUSY'
    | 'WORKSTATION_IS_BUSY'
    | 'UNEXPECTED_ERROR';

export type AssignCatToWorkstationResult =
    | {
        ok: true;
        state: GameState;
    }
    | {
        ok: false;
        error: AssignCatToWorkstationErrorTypes;
    };

export function assignCatToWorkstation(
    state: GameState,
    catId: string,
    workstationId: string,
): AssignCatToWorkstationResult {
    const cat = state.cats.find(item => item.id === catId);
    const workstation = state.workstations.find(item => item.id === workstationId);

    if (!cat) {
        return returnError('CAT_NOT_FOUND');
    }

    if (!workstation) {
        return returnError('WORKSTATION_NOT_FOUND');
    }

    if (cat.workstationId !== null || cat.state !== 'idle') {
        return returnError('CAT_IS_BUSY');
    }

    if (workstation.assignedCatId !== null || workstation.state !== 'idle') {
        return returnError('WORKSTATION_IS_BUSY');
    }

    return {
        ok: true,
        state: {
            ...state,

            cats: state.cats.map(item => {
                return item.id === catId
                    ? {
                        ...item,
                        workstationId,
                    }
                    : item;
            }),

            workstations: state.workstations.map(item => {
                return item.id === workstationId
                    ? {
                        ...item,
                        assignedCatId: catId,
                    }
                    : item;
            }),
        },
    };
}

function returnError(
    errorCode: AssignCatToWorkstationErrorTypes,
): AssignCatToWorkstationResult {
    return {
        ok: false,
        error: errorCode,
    };
}
