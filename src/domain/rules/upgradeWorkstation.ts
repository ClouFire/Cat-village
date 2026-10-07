import { configs } from '../configs/kitchens/index';

import type { GameState } from '../entities/GameState';

export type UpgradeWorkstationError =
    | 'WORKSTATION_NOT_FOUND'
    | 'WORKSTATION_MAXIMUM_LEVEL';

export type UpgradeWorkstationResult =
    | {
        ok: false,
        error: UpgradeWorkstationError
    }
    | {
        ok: true,
        state: GameState
    };

export function upgradeWorkstation(
    state: GameState,
    workstationId: string
): UpgradeWorkstationResult {
    const workstation = state.workstations.find(item => item.id === workstationId);

    if (!workstation) {
        return {
            ok: false,
            error: 'WORKSTATION_NOT_FOUND'
        }
    }

    const nextLevel = workstation.level + 1; 
    const newLevelStats = configs?.[nextLevel];

    if (!newLevelStats) {
        return {
            ok: false,
            error: 'WORKSTATION_MAXIMUM_LEVEL'
        }
    }

    return {
        ok: true,
        state: {
            ...state,

            workstations: state.workstations.map(item => {
                return item.id === workstation.id ? {...item, ...newLevelStats} : item
            })
        }
    }
}