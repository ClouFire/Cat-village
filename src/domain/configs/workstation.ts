export type WorkstationType =
    | 'kitchen';

export const workstationCollections = {
    kitchen: 'kitchens',
} as const;

export type WorkstationStates =
    | 'idle'
    | 'waiting_for_cat'
    | 'ready'
    | 'producing';