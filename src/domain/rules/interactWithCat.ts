import type { GameState } from '../entities/GameState';

export type InteractWithCatResult  = 
    | {
        ok: true;
        state: GameState;
    } 
    | {
        ok: false;
        error: 'CAT_NOT_FOUND';
    };

export function interactWithCat(
    state: GameState,
    catId: string
) : InteractWithCatResult  {
    const cat = state.cats.find(
        item => item.id === catId,
    );

    if (!cat) {
        return {
            ok: false,
            error: 'CAT_NOT_FOUND',
        };
    }

    const nextState = cat.state === 'idle' ? 'resting' : 'idle';

    return {
        ok: true,
        state: {
            ...state,

            cats: state.cats.map(item => {
                return item.id === catId ? {...item, state: nextState} : item
            })
        }
    };
}
