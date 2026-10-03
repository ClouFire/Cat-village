import type { GameState } from '../entities/GameState';
import { Position } from '../value-objects/Position';
import { collectProduction } from './collectProduction';

export type InteractWithKitchenResult  = 
    | {
        ok: true;
        state: GameState;
    } 
    | {
        ok: false;
        error: 'KITCHEN_NOT_FOUND' | 'KITCHEN_ALREADY_HAS_CAT' | 'CAT_NOT_FOUND';
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

    const cat = state.cats[0];

    if (!cat) {
        return {
            ok: false,
            error: 'CAT_NOT_FOUND'
        };
    }

    if (kitchen.state === 'idle' && cat.state === 'idle') {
        const nextKitchenState = 'waiting_for_cat';
        const nextCatState = 'moving';
        const catId = cat.id;

        const newCatTargetPosition: Position = {
            x: kitchen.position.x,
            y: kitchen.position.y,
        };

        return {
            ok: true,
            state: {
                ...state,

                kitchens: state.kitchens.map(item => {
                    return item.id === kitchenId ? {...item, state: nextKitchenState, catId: catId} : item
                }),
                
                cats: state.cats.map(item => {
                    return item.id === catId ? {...item, state: nextCatState, targetPosition: newCatTargetPosition} : item
                }),
            }
        };
    }

    if (kitchen.state === 'ready') {
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

    return {
        ok: false,
        error: 'KITCHEN_ALREADY_HAS_CAT'
    };
}
