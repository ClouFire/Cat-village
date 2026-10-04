import { assignCatToKitchen as applyRule} from '../../domain/rules/assignCatToKitchen';

import type { AssignCatToKitchenResult } from '../../domain/rules/assignCatToKitchen';
import type { GameStore } from '../store/GameStore';

export function createAssignCatToKitchenUseCase(store: GameStore) {
    return (catId: string, kitchenId: string): AssignCatToKitchenResult => {
        let result: AssignCatToKitchenResult = {
            ok: false,
            error: 'UNEXPECTED_ERROR',
        };

        store.update(state => {
            result = applyRule(state, catId, kitchenId);

            return result.ok ? result.state : state;
        });

        return result;
    }
}