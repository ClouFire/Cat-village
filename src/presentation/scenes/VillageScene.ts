import * as Phaser from 'phaser';

import type { GameState } from '../../domain/entities/GameState';
import type { GameStore } from '../../application/store/GameStore';
import type { Position } from '../../domain/value-objects/Position';
import type {
    AvailableCatsList,
    WorkstationClickActionResult,
} from '../../application/use-cases/workstationClickActionUseCase';

import { CatView } from '../game-objects/CatView';
import { KitchenView } from '../game-objects/KitchenView';

export interface VillageSceneDependencies {
    store: GameStore;

    interactWithCat: (catId: string) => void;
    moveCat: (catId: string, target: Position) => void;

    resolveWorkstationClickAction: (workstationId: string) => WorkstationClickActionResult;
    collectWorkstationProduction: (workstationId: string) => void;
    assignCatToWorkstation: (catId: string, workstationId: string) => void;
    upgradeWorkstation: (workstationId: string) => void;

    tick: (elapsedMs: number) => void;
}

export class VillageScene extends Phaser.Scene {
    private readonly dependencies: VillageSceneDependencies;
    private readonly catViews = new Map<string, CatView>();
    private readonly workstationViews = new Map<string, KitchenView>();
    private catSelectorContainer: Phaser.GameObjects.Container | null = null;
    private unsubscribe: (() => void) | null = null;

    constructor(dependencies: VillageSceneDependencies) {
        super({
            key: 'VillageScene',
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
    }

    update(_time: number, delta: number): void {
        this.dependencies.tick(delta);
    }

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
                        y: pointer.worldY,
                    },
                );
            },
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
        const activeCatIds = new Set(
            state.cats.map(cat => cat.id),
        );

        for (const [id, view] of this.catViews) {
            if (!activeCatIds.has(id)) {
                view.destroy();
                this.catViews.delete(id);
            }
        }

        state.cats.forEach(cat => {
            let view = this.catViews.get(cat.id);

            if (!view) {
                view = new CatView(
                    this,
                    cat.position.x,
                    cat.position.y,
                    cat,
                    this.dependencies.interactWithCat,
                );

                this.catViews.set(cat.id, view);
            }

            view.render(cat);
        });

        const activeWorkstationIds = new Set(
            state.workstations.map(workstation => workstation.id),
        );

        for (const [id, view] of this.workstationViews) {
            if (!activeWorkstationIds.has(id)) {
                view.destroy();
                this.workstationViews.delete(id);
            }
        }

        state.workstations.forEach(workstation => {
            switch (workstation.type) {
                case 'kitchen': {
                    let view = this.workstationViews.get(workstation.id);

                    if (!view) {
                        view = new KitchenView(
                            this,
                            workstation.position.x,
                            workstation.position.y,
                            workstation,
                            workstationId => this.handleWorkstationClick(workstationId),
                        );

                        this.workstationViews.set(workstation.id, view);
                    }

                    view.render(workstation);
                    break;
                }
            }
        });
    }

    private handleShutdown(): void {
        this.unsubscribe?.();
        this.unsubscribe = null;

        for (const view of this.catViews.values()) {
            view.destroy();
        }

        for (const view of this.workstationViews.values()) {
            view.destroy();
        }

        this.closeCatSelector();
        this.catViews.clear();
        this.workstationViews.clear();
    }

    private handleWorkstationClick(workstationId: string): void {
        const result = this.dependencies.resolveWorkstationClickAction(workstationId);

        if (!result.ok) {
            console.warn(
                'Workstation click resolve failed',
                result.error,
            );

            return;
        }

        switch (result.action) {
            case 'COLLECT_PRODUCTION':
                this.dependencies.collectWorkstationProduction(result.workstationId);
                break;

            case 'OPEN_CAT_SELECTOR':
                this.openCatSelector(
                    result.workstationId,
                    result.availableCatsList,
                );
                break;

            case 'NOOP':
                break;
        }
    }

    private openCatSelector(
        workstationId: string,
        cats: AvailableCatsList,
    ): void {
        this.closeCatSelector();

        const width = this.scale.width;
        const height = this.scale.height;

        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.35,
        );

        overlay.setInteractive();

        const panelWidth = 300;
        const rowHeight = 46;
        const panelPadding = 20;
        const titleHeight = 46;
        const footerHeight = cats.length === 0 ? 54 : 18;

        const panelHeight =
            panelPadding * 2
            + titleHeight
            + cats.length * rowHeight
            + footerHeight;

        const panel = this.add.container(
            width / 2,
            height / 2,
        );

        panel.setDepth(1000);

        const background = this.add.rectangle(
            0,
            0,
            panelWidth,
            panelHeight,
            0xfff7e8,
            1,
        );

        background.setStrokeStyle(
            2,
            0x49382e,
        );

        const title = this.add.text(
            0,
            -panelHeight / 2 + 26,
            'Выбери кота',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#49382e',
                fontStyle: 'bold',
            },
        );

        title.setOrigin(0.5);

        const subtitle = this.add.text(
            0,
            -panelHeight / 2 + 52,
            'Кто будет работать здесь?',
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#776454',
            },
        );

        subtitle.setOrigin(0.5);

        const closeButton = this.add.text(
            panelWidth / 2 - 24,
            -panelHeight / 2 + 18,
            '×',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#49382e',
                fontStyle: 'bold',
            },
        );

        const upgradeButton = this.add.text(
            -panelWidth / 2 + 24,
            -panelHeight / 2 + 18,
            '^',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#49382e',
                fontStyle: 'bold',
            },
        )

        closeButton.setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });

        upgradeButton.setOrigin(0.5);
        upgradeButton.setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            this.closeCatSelector();
        });

        upgradeButton.on('pointerdown', () => {
            this.dependencies.upgradeWorkstation(
                workstationId
            );
        })

        panel.add([
            background,
            title,
            subtitle,
            closeButton,
            upgradeButton,
        ]);

        if (cats.length === 0) {
            const emptyText = this.add.text(
                0,
                18,
                'Нет доступных котов',
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#776454',
                },
            );

            emptyText.setOrigin(0.5);
            panel.add(emptyText);
        }

        cats.forEach((cat, index) => {
            const y =
                -panelHeight / 2
                + panelPadding
                + titleHeight
                + 28
                + index * rowHeight;

            const row = this.add.rectangle(
                0,
                y,
                panelWidth - 40,
                36,
                0xf2dfbd,
                1,
            );

            row.setStrokeStyle(
                1,
                0xd0b48a,
            );

            row.setInteractive({ useHandCursor: true });

            const catName = this.add.text(
                -panelWidth / 2 + 54,
                y,
                cat.name,
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#49382e',
                    fontStyle: 'bold',
                },
            );

            catName.setOrigin(0, 0.5);

            const actionText = this.add.text(
                panelWidth / 2 - 54,
                y,
                'Выбрать',
                {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    color: '#776454',
                },
            );

            actionText.setOrigin(1, 0.5);

            const selectCat = () => {
                this.dependencies.assignCatToWorkstation(
                    cat.id,
                    workstationId,
                );

                this.closeCatSelector();
            };

            row.on('pointerdown', selectCat);
            catName.setInteractive({ useHandCursor: true });
            catName.on('pointerdown', selectCat);

            row.on('pointerover', () => {
                row.setFillStyle(
                    0xe8c990,
                    1,
                );
            });

            row.on('pointerout', () => {
                row.setFillStyle(
                    0xf2dfbd,
                    1,
                );
            });

            panel.add([
                row,
                catName,
                actionText,
            ]);
        });

        const modal = this.add.container(0, 0, [
            overlay,
            panel,
        ]);

        modal.setDepth(1000);
        this.catSelectorContainer = modal;
    }

    private closeCatSelector(): void {
        if (!this.catSelectorContainer) {
            return;
        }

        this.catSelectorContainer.destroy(true);
        this.catSelectorContainer = null;
    }
}
