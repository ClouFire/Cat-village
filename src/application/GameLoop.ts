import type { GameStore } from './store/GameStore';

import { simulateMovement, simulateKitchenArrival } from '../domain/systems/MovementSystem';
import { simulateProduction } from '../domain/systems/ProductionSystem';

export class GameLoop {    
    constructor(
        private readonly store: GameStore,
    ) {}

    tick(elapsedMs: number): void {
        this.store.update(state => simulateMovement(state, elapsedMs));
        this.store.update(state => simulateKitchenArrival(state));
        this.store.update(state => simulateProduction(state, elapsedMs));

        (window as any).gameStore = this.store;
    };
}