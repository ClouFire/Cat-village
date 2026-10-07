import type { Position } from '../../domain/value-objects/Position';
import type { GameStore } from '../../application/store/GameStore';

import { moveCat as applyMoveCatRule, MoveCatResult} from '../../domain/rules/moveCat';

export type MoveCatUseCase = (
    catId: string,
    target: Position,
) => MoveCatResult;

export function createMoveCatUseCase(store: GameStore): MoveCatUseCase {
    return (catId, target) => {
        let result: MoveCatResult = {
            ok: false,
            error: 'CAT_NOT_FOUND',
        };

        store.update(state => {
            result = applyMoveCatRule(state, catId, target);

            return result.ok ? result.state : state;
        });

        return result;
    }
}
