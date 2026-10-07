import type { GameState } from '../entities/GameState';
import type { Cat } from '../entities/Cat';

import { getRandomInt } from './helpers/helpers';

function moveCatByTime(
    cat: Cat,
    elapsedMs: number,
): Cat {
    if (
        cat.targetPosition === null
    ) {
        return cat;
    }

    const dx = cat.targetPosition.x - cat.position.x;
    const dy = cat.targetPosition.y - cat.position.y;

    const distance = Math.hypot(dx, dy);
    const maxDistance = cat.movementSpeed * (elapsedMs / 1000);

    if (distance <= maxDistance) {
      if (cat.state === 'moving') {
        return {
            ...cat,

            position: {
                ...cat.targetPosition,
            },

            targetPosition: null,
            state: 'idle'
        };
      }
      
      if (cat.state === 'resting' || cat.state === 'idle') {
        return {
            ...cat,

            position: {
                ...cat.targetPosition,
            },

            targetPosition: null,
        };
      }
    }

    if (distance === 0 && cat.state !== 'resting') {
        return {
            ...cat,
            targetPosition: null,
            state: 'idle',
        };
    }

    const ratio = maxDistance / distance;

    return {
        ...cat,

        position: {
            x: cat.position.x + dx * ratio,
            y: cat.position.y + dy * ratio,
        },
    };
}

export function simulateMovement(
    state: GameState,
    elapsedMs: number,
): GameState {
    if (
        !Number.isFinite(elapsedMs)
        || elapsedMs <= 0
    ) {
        return state;
    }

    const cats = state.cats.map(
        cat => moveCatByTime(cat, elapsedMs),
    );

    if (
        cats.every(
            (cat, index) => cat === state.cats[index],
        )
    ) {
        return state;
    }

    return {
        ...state,
        cats,
    };
}

export function simulateCatWandering(
    state: GameState
): GameState {
    return {
        ...state,
        
        cats: state.cats.map(item => {
            if ((item.state === 'idle' || item.state === 'resting') && item.targetPosition === null) {
                const newPosition = {
                    x: getRandomInt(100, 190, Math.random),
                    y: getRandomInt(400, 500, Math.random),
                };

                return {...item, targetPosition: newPosition};
            }

            return item;
        }),
    }
}
