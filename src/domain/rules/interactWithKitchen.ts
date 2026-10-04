import type { GameState } from '../entities/GameState';
import { collectProduction } from './collectProduction';

export type InteractWithKitchenResult  = 
    | {
        ok: true;
        state: GameState;
    } 
    | {
        ok: false;
        error: 'KITCHEN_NOT_FOUND' | 'KITCHEN_ALREADY_HAS_CAT' | 'UNEXPECTED_ERROR';
    };

export function interactWithKitchen(
    state: GameState,
    kitchenId: string
) : InteractWithKitchenResult  {
    const kitchen = state.kitchens.find(
        item => item.id === kitchenId,
    );

    if (!kitchen) {
        return {
            ok: false,
            error: 'KITCHEN_NOT_FOUND',
        };
    }

    const nextKitchenState = 'idle';

    const productionResult = collectProduction(state, kitchen.type, kitchenId);

    if (productionResult.ok) {
        return {
            ok: true,
            state: {
                ...state,

                kitchens: state.kitchens.map(item => {
                    return item.id === kitchenId ? {...item, state: nextKitchenState} : item
                }),

                inventory: productionResult.state.inventory
            }
        }
    }
    
    return {
        ok: true,
        state: {
            ...state,

            kitchens: state.kitchens.map(item => {
                return item.id === kitchenId ? {...item, state: nextKitchenState} : item
            }),
        }
    }
}
