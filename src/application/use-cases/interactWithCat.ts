import { interactWithCat as applyRule, InteractWithCatResult } from '../../domain/rules/interactWithCat';

import type { GameStore } from '../store/GameStore';

export function createInteractWithCatUseCase (
    store: GameStore,
) {
    return (catId: string): InteractWithCatResult => {
        let result: InteractWithCatResult = {
            ok: false,
            error: 'CAT_NOT_FOUND'
        };

        store.update(state => {
            result = applyRule(state, catId);

            return result.ok ? result.state : state;
        });

        return result;
    };
}