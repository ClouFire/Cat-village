import type { Workstation } from '../Workstation';

export interface KitchenWorkstation extends Workstation {
    type: 'kitchen';
}

export type Kitchen = KitchenWorkstation;
