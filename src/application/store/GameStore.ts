import type { GameState } from '../../domain/entities/GameState';

export type GameStateListener = (state: Readonly<GameState>) => void;

export class GameStore {
    private state: GameState;
    private readonly listeners = new Set<GameStateListener>();

    constructor(initialState: GameState) {
        this.state = initialState;
    }

    getState(): Readonly<GameState> {
        return this.state;
    }

    update(updater: (state: GameState) => GameState): void {
        const nextState = updater(this.state);

        if (nextState === this.state) {
            return;
        }

        this.state = nextState;

        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    subscribe(listener: GameStateListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }
}