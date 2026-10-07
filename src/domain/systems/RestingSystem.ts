import type { GameState } from '../entities/GameState';

export function simulateCatRest(
    state: GameState,
    elapsedMs: number
): GameState {
    if (!state.cats.filter(item => item.state === 'resting')) {
        return state;
    }

    return {
        ...state,

        cats: state.cats.map(item => {
            if (item.state === 'resting') {
                const newRemainingTime = Math.max(0, item.restingTimeRemaining - elapsedMs);
                const newState = newRemainingTime === 0 ? 'idle' : 'resting';

                return {...item, state: newState, restingTimeRemaining: newRemainingTime};
            } else {
                return item;
            }
        }),
    }
}