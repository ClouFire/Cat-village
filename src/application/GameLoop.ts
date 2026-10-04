import type { GameStore } from './store/GameStore';

import { simulateMovement, simulateLeavingWorkstation } from '../domain/systems/MovementSystem';
import {
    simulateAssignedWorkstations,
    simulateWorkstationArrival,
    simulateWorkstationProduction,
} from '../domain/systems/WorkstationCycleSystem';

export class GameLoop {
    constructor(
        private readonly store: GameStore,
    ) {}

    tick(elapsedMs: number): void {
        this.store.update(state => simulateAssignedWorkstations(state));
        this.store.update(state => simulateMovement(state, elapsedMs));
        this.store.update(state => simulateWorkstationArrival(state));
        this.store.update(state => simulateWorkstationProduction(state, elapsedMs));
        this.store.update(state => simulateLeavingWorkstation(state, elapsedMs));

        (window as unknown as { gameStore?: GameStore }).gameStore = this.store;
    }
}
