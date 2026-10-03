import type { GameState } from '../entities/GameState';
import type { Position } from '../value-objects/Position';

export function simulateProduction(
    state: GameState,
    elapsedMs: number
): GameState {
    const kitchen = state.kitchens.find(item => item.state === 'producing');

    if (!kitchen) {
        return state;
    }

    const kitchenId = kitchen.id;
    const catId = kitchen.catId;

    if (catId === null) {
        return state;
    }

    if (kitchen.productionRemaining === null) {
        return state;
    }

    if (kitchen.productionRemaining <= 0) {
        const newKitchenProducingRemain = null;
        const newKitchenState = 'ready';

        const newCatState = 'moving';
        const newCatTarget = {
            x: getRandomInt(100, 190),
            y: getRandomInt(400, 500)
        }

        return {
            ...state,

            kitchens: state.kitchens.map(item => {
                return item.id === kitchenId ? {...item, state: newKitchenState, producingRemainingMs: newKitchenProducingRemain, catId: null} : item
            }),

            cats: state.cats.map(item => {
                return item.id === catId ? {...item, state: newCatState, targetPosition: newCatTarget, kitchenId: null} : item
            }),
        }
    }

    const newProducingRemain = kitchen.productionRemaining - (kitchen.productionSpeed * elapsedMs);

    return {
        ...state,

        kitchens: state.kitchens.map(item => {
            return item.id === kitchenId ? {...item, productionRemaining: newProducingRemain} : item
        }),
    }
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}