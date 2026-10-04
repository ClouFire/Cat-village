import type { GameStore } from '../store/GameStore';

export type AvailableCatsList = {
    id: string,
    name: string
}[];

export type KitchenClickActionResult =
    | {
        ok: true,
        action: 'OPEN_CAT_SELECTOR',
        kitchenId: string,
        availableCatsList: AvailableCatsList
    }
    | {
        ok: true,
        action: 'COLLECT_PRODUCTION',
        kitchenId: string,
    }
    | {
        ok: true,
        action: 'NOOP',
    }
    | {
        ok: false,
        error: 'KITCHEN_NOT_FOUND' | 'KITCHEN_IS_BUSY' | 'KITCHEN_ALREADY_HAS_CAT'
    }

export function createKitchenClickActionUseCase(store: GameStore) {
    return (kitchenId: string): KitchenClickActionResult => {
        const state = store.getState();

        const kitchen = state.kitchens.find(item => item.id === kitchenId);

        if (!kitchen) {
            return {
                ok: false,
                error: 'KITCHEN_NOT_FOUND'
            }
        }
        
        switch (kitchen.state) {
            case 'idle':
                const availableCatsList: AvailableCatsList = state.cats
                .filter(item => item.kitchenId === null)
                .map(item => {
                    return {
                        id: item.id,
                        name: item.name
                    }
                });

                return {
                    ok: true,
                    action: 'OPEN_CAT_SELECTOR',
                    kitchenId: kitchen.id,
                    availableCatsList: availableCatsList
                }

            case 'ready':
                return {
                    ok: true,
                    action: 'COLLECT_PRODUCTION',
                    kitchenId: kitchen.id,
                }

            case 'waiting_for_cat':
            case 'producing':
                return {
                    ok: true,
                    action: 'NOOP'
                }
        }
    }
}