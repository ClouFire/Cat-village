import type { GameStore } from './store/GameStore';

import { 
    simulateMovement, 
    simulateCatWandering 
} from '../domain/systems/MovementSystem';

import {
    simulateAssignedWorkstations,
    simulateWorkstationArrival,
    simulateWorkstationProduction,
} from '../domain/systems/WorkstationCycleSystem';

import { simulateCatRest } from '../domain/systems/RestingSystem';

export class GameLoop {
    constructor(
        private readonly store: GameStore,
    ) {}

    tick(elapsedMs: number): void {
        this.store.update(state => simulateAssignedWorkstations(state));
        this.store.update(state => simulateMovement(state, elapsedMs));
        this.store.update(state => simulateWorkstationArrival(state));
        this.store.update(state => simulateWorkstationProduction(state, elapsedMs));
        this.store.update(state => simulateCatWandering(state));
        this.store.update(state => simulateCatRest(state, elapsedMs));

        (window as unknown as { gameStore?: GameStore }).gameStore = this.store;
    }
}
