import { ProductionTypes } from "../configs/Production";

export type InventoryItems = Partial<Record<ProductionTypes, number>>;

export interface Inventory {
    id: string;
    name: string;

    items: InventoryItems;
}