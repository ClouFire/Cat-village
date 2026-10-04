import type { Cat } from './Cat';
import type { Workstation } from './workstation/Workstation';
import type { Inventory } from './Inventory';

export interface GameState {
    version: number;
    cats: Cat[];
    workstations: Workstation[];
    inventory: Inventory;
}
