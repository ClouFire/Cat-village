import type { GameState } from '../entities/GameState';
import type { Position } from '../value-objects/Position';

export type MoveCatError = 'CAT_NOT_FOUND' | 'INVALID_TARGET_POSITION' | 'CAT_IS_BUSY';
export type MoveCatResult = 
    | {
        ok: true,
        state: GameState,
    }
    | {
        ok: false,
        error: MoveCatError,
    };

export function moveCat(
    state: GameState,
    catId: string,
    target: Position
): MoveCatResult {
    const cat = state.cats.find(
        item => item.id === catId,
    );

    if (!cat) {
        return {
            ok: false,
            error: 'CAT_NOT_FOUND',
        };
    }

    if (cat.state === 'cooking') {
        return {
            ok: false,
            error: 'CAT_IS_BUSY',
        };
    }

    if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) {
        return {
            ok: false,
            error: 'INVALID_TARGET_POSITION',
        };
    }

    return {
        ok: true,
        state: {
            ...state,

            cats: state.cats.map(item =>
                item.id === catId
                ? {
                    ...item,

                    state: 'moving',

                    targetPosition: {
                        x: target.x,
                        y: target.y,
                    },
                }
                : item,
            ),
        }
    }
}
