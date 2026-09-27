import { interactWithKitchen as applyRule } from '../../domain/rules/interactWithKitchen';

import type { InteractWithKitchenResult } from '../../domain/rules/interactWithKitchen';
import type { GameStore } from '../store/GameStore';

export function createInteractWithKitchenUseCase (
    store: GameStore,
) {
    return (kitchenId: string): InteractWithKitchenResult => {
        let result: InteractWithKitchenResult = {
            ok: false,
            error: 'KITCHEN_NOT_FOUND'
        };

        store.update(state => {
            result = applyRule(state, kitchenId);

            return result.ok ? result.state : state;
        });

        return result;
    };
}