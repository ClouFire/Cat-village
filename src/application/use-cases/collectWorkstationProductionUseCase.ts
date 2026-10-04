import { collectWorkstationProduction as applyRule } from '../../domain/rules/collectWorkstationProduction';

import type { CollectWorkstationProductionResult } from '../../domain/rules/collectWorkstationProduction';
import type { GameStore } from '../store/GameStore';

export function createCollectWorkstationProductionUseCase(
    store: GameStore,
) {
    return (workstationId: string): CollectWorkstationProductionResult => {
        let result: CollectWorkstationProductionResult = {
            ok: false,
            error: 'WORKSTATION_NOT_FOUND',
        };

        store.update(state => {
            result = applyRule(state, workstationId);

            return result.ok ? result.state : state;
        });

        return result;
    };
}
