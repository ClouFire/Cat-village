import { assignCatToKitchen, AssignCatToKitchenResult } from './assignCatToKitchen';
import { interactWithKitchen, InteractWithKitchenResult } from './interactWithKitchen';
import { GameState } from "../entities/GameState";

export type handleKitchenInteractResult = 
    | AssignCatToKitchenResult
    | InteractWithKitchenResult

export function handleKitchenInteract(state: GameState, kitchenId: string, catId: string): handleKitchenInteractResult {
    const kitchen = state.kitchens.find(item => item.id === kitchenId);

    if (!kitchen) {
        return {
            ok: false,
            error: 'KITCHEN_NOT_FOUND'
        }
    }

    if (kitchen.state === 'idle') {
        const result = assignCatToKitchen(state, kitchenId, catId);

        return returnResult(result);
    }

    if (kitchen.state === 'ready') {
        const result = interactWithKitchen(state, kitchenId);

        return returnResult(result);
    }

    return {
        ok: false,
        error: 'UNEXPECTED_ERROR'
    }
}

function returnResult(result: handleKitchenInteractResult): handleKitchenInteractResult {
    if (result.ok) {
        return {
            ok: true,
            state: {
                ...result.state
            }
        }
    }

    return result;
}