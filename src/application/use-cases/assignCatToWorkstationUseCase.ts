import { assignCatToWorkstation as applyRule } from '../../domain/rules/assignCatToWorkstation';

import type { AssignCatToWorkstationResult } from '../../domain/rules/assignCatToWorkstation';
import type { GameStore } from '../store/GameStore';

export function createAssignCatToWorkstationUseCase(store: GameStore) {
    return (
        catId: string,
        workstationId: string,
    ): AssignCatToWorkstationResult => {
        let result: AssignCatToWorkstationResult = {
            ok: false,
            error: 'UNEXPECTED_ERROR',
        };

        store.update(state => {
            result = applyRule(state, catId, workstationId);

            return result.ok ? result.state : state;
        });

        return result;
    };
}
