import type { Cat } from './Cat';
import type { Kitchen } from './Kitchen';
import type { Inventory } from './Inventory';

export interface GameState {
    version: number;
    cats: Cat[];
    kitchens: Kitchen[];
    inventory: Inventory;
}