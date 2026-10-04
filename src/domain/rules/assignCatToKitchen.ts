import { GameState } from "../entities/GameState";

export type AssignCatToKitchenErrorTypes =
    | 'CAT_NOT_FOUND' 
    | 'KITCHEN_NOT_FOUND' 
    | 'CAT_IS_BUSY' 
    | 'KITCHEN_IS_BUSY'
    | 'UNEXPECTED_ERROR'

export type AssignCatToKitchenResult =
    | {
        ok: true,
        state: GameState,
    }
    | {
        ok: false,
        error: AssignCatToKitchenErrorTypes,
    }

export function assignCatToKitchen(state: GameState, kitchenId: string, catId: string): AssignCatToKitchenResult {
    const cat = state.cats.find(item => item.id === catId);
    const kitchen = state.kitchens.find(item => item.id === kitchenId);

    if (!cat) return returnError('CAT_NOT_FOUND');

    if (!kitchen) return returnError('KITCHEN_NOT_FOUND');

    if (cat.kitchenId !== null) return returnError('CAT_IS_BUSY');

    if (kitchen.catId !== null) return returnError('KITCHEN_IS_BUSY');

    return {
        ok: true,
        state: {
            ...state,
            cats: state.cats.map(item => {
                return item.id === catId ? {...item, kitchenId: kitchenId} : item
            }),

            kitchens: state.kitchens.map(item => {
                return item.id === kitchenId ? {...item, catId: catId} : item
            }),
        }
    }
}

function returnError(errorCode: AssignCatToKitchenErrorTypes): AssignCatToKitchenResult {
    return {
        ok: false,
        error: errorCode
    }
}