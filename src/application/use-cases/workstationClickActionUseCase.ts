import type { GameStore } from '../store/GameStore';

export type AvailableCatOption = {
    id: string;
    name: string;
};

export type AvailableCatsList = AvailableCatOption[];

export type WorkstationClickActionResult =
    | {
        ok: true;
        action: 'OPEN_CAT_SELECTOR';
        workstationId: string;
        availableCatsList: AvailableCatsList;
    }
    | {
        ok: true;
        action: 'COLLECT_PRODUCTION';
        workstationId: string;
    }
    | {
        ok: true;
        action: 'NOOP';
    }
    | {
        ok: false;
        error: 'WORKSTATION_NOT_FOUND';
    };

export function createWorkstationClickActionUseCase(store: GameStore) {
    return (workstationId: string): WorkstationClickActionResult => {
        const state = store.getState();

        const workstation = state.workstations.find(
            item => item.id === workstationId,
        );

        if (!workstation) {
            return {
                ok: false,
                error: 'WORKSTATION_NOT_FOUND',
            };
        }

        switch (workstation.state) {
            case 'idle': {
                if (workstation.assignedCatId !== null) {
                    return {
                        ok: true,
                        action: 'NOOP',
                    };
                }

                const availableCatsList: AvailableCatsList = state.cats
                    .filter(item => {
                        return item.workstationId === null && item.state === 'idle';
                    })
                    .map(item => {
                        return {
                            id: item.id,
                            name: item.name,
                        };
                    });

                return {
                    ok: true,
                    action: 'OPEN_CAT_SELECTOR',
                    workstationId: workstation.id,
                    availableCatsList,
                };
            }

            case 'ready':
                return {
                    ok: true,
                    action: 'COLLECT_PRODUCTION',
                    workstationId: workstation.id,
                };

            case 'waiting_for_cat':
            case 'producing':
                return {
                    ok: true,
                    action: 'NOOP',
                };
        }
    };
}
