import type { GameState } from '../entities/GameState';
import type { Cat } from '../entities/Cat';

function moveCatByTime(
    cat: Cat,
    elapsedMs: number,
): Cat {
    if (
        cat.state !== 'moving'
        || cat.targetPosition === null
    ) {
        return cat;
    }

    const dx = cat.targetPosition.x - cat.position.x;
    const dy = cat.targetPosition.y - cat.position.y;

    const distance = Math.hypot(dx, dy);
    const maxDistance = cat.movementSpeed * (elapsedMs / 1000);

    if (distance <= maxDistance) {
        return {
            ...cat,

            position: {
                ...cat.targetPosition,
            },

            targetPosition: null,
            state: 'idle',
        };
    }

    if (distance === 0) {
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

export function simulateLeavingWorkstation(
    state: GameState,
    elapsedMs: number,
): GameState {
    const cats = state.cats.map(cat => {
        if (cat.state !== 'moving') {
            return cat;
        }

        return moveCatByTime(cat, elapsedMs);
    });

    const hasChanges = cats.some(
        (cat, index) => cat !== state.cats[index],
    );

    if (!hasChanges) {
        return state;
    }

    return {
        ...state,
        cats,
    };
}
