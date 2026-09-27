import * as Phaser from 'phaser';

import type { GameState } from '../../domain/entities/GameState';
import type { GameStore } from '../../application/store/GameStore';
import type { Position } from '../../domain/value-objects/Position';

import { CatView } from '../game-objects/CatView';
import { KitchenView } from '../game-objects/KiktchenView';

export interface VillageSceneDependencies {
    store: GameStore;
    
    interactWithCat: (catId: string) => void;
    moveCat: (catId: string, target: Position) => void;

    interactWithKitchen: (kitchenId: string) => void;
    
    tick: (elapsedMs: number) => void;
}

export class VillageScene extends Phaser.Scene {
    private readonly dependencies: VillageSceneDependencies;
    private readonly catViews = new Map<string, CatView>();
    private readonly kitchenViews = new Map<string, KitchenView>();
    private unsubscribe: (() => void) | null = null;

    constructor(dependencies: VillageSceneDependencies) {
        super({
            key: 'VillageScene'
        });

        this.dependencies = dependencies;
    }

    create(): void {
        this.createEnvironment();

        this.renderVillage(
            this.dependencies.store.getState(),
        );

        this.unsubscribe = this.dependencies.store.subscribe(
            state => {
                this.renderVillage(state);
            },
        );

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.handleShutdown,
            this,
        );
    };

    update(_time: number, delta: number): void {
        this.dependencies.tick(delta);
    };

    private createEnvironment(): void {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0xf4ead7,
        );

        const clearing = this.add.ellipse(
            width / 2,
            height * 0.57,
            width * 0.9,
            height * 0.5,
            0xc6d9a5,
        );

        clearing.setInteractive();

        clearing.on(
            'pointerdown',
            (pointer: Phaser.Input.Pointer) => {
                const cat = this.dependencies.store.getState().cats[0];

                if (!cat) {
                    return;
                }

                this.dependencies.moveCat(
                    cat.id,
                    {
                        x: pointer.worldX,
                        y: pointer.worldY
                    },
                );
            }
        );


        this.add.text(
            width / 2,
            90,
            'Cat Village',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#49382e',
                fontStyle: 'bold',
            },
        ).setOrigin(0.5);

        this.add.text(
            width / 2,
            135,
            'Маленький уютный мир',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#776454',
            },
        ).setOrigin(0.5);
    }

    private renderVillage(state: Readonly<GameState>): void {
        const activeIds = new Set(
            state.cats.map(cat => cat.id),
        );

        for (const [id, view] of this.catViews) {
            if (!activeIds.has(id)) {
                view.destroy();
                this.catViews.delete(id);
            }
        }

        state.cats.forEach((cat, index) => {
            let view = this.catViews.get(cat.id);

            if (!view) {
                view = new CatView(
                    this,
                    cat.position.x,
                    cat.position.y,
                    cat,
                    this.dependencies.interactWithCat    
                );

                this.catViews.set(cat.id, view);
            }

            view.render(cat);
        });

        state.kitchens.forEach((kitchen, index) => {
            let view = this.kitchenViews.get(kitchen.id);

            if (!view) {
                view = new KitchenView(
                    this,
                    kitchen.position.x,
                    kitchen.position.y,
                    kitchen,
                    this.dependencies.interactWithKitchen
                );

                this.kitchenViews.set(kitchen.id, view);
            }

            view.render(kitchen);
        });
    }

    private handleShutdown(): void {
        this.unsubscribe?.();

        this.unsubscribe = null;

        for (const view of this.catViews.values()) {
            view.destroy();
        }

        this.catViews.clear();
    }
}