import type { GameState } from '../entities/GameState';
import type { Position } from '../value-objects/Position';


import { moveCat } from '../rules/moveCat';


export function simulateProduction(
    state: GameState,
    elapsedMs: number
): GameState {
    const kitchen = state.kitchens.find(item => item.state === 'producing');

    if (!kitchen) {
        return state;
    }

    if (kitchen.producingRemainingMs === null) {
        return state;
    }

    if (kitchen.producingRemainingMs <= 0) {
        kitchen.producingRemainingMs = null;
        kitchen.state = 'ready';

        const cat = state.cats.find(item => item.id === kitchen.catId);
        const position: Position = {
            x: 195,
            y: 420
        };

        kitchen.catId = null;

        if (cat) {
            cat.state = 'resting';
            cat.kitchenId = null;
            const moveCatResult = moveCat(state, cat.id, position);

            if (moveCatResult.ok) {
                state.cats = moveCatResult.state.cats;
            }
        }

        return {
            ...state,
        };
    }

    kitchen.producingRemainingMs -= kitchen.producingSpeed * elapsedMs;

    return {
        ...state,
    }
}