import * as Phaser from 'phaser';

import type { Workstation } from '../../domain/entities/workstation/Workstation';

export class KitchenView extends Phaser.GameObjects.Container {
    private readonly bodyShape: Phaser.GameObjects.Rectangle;
    private readonly statusText: Phaser.GameObjects.Text;
    private readonly onInteract: (workstationId: string) => void;
    private readonly workstationId: string;
    private currentState: Workstation['state'] | null = null;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        workstation: Workstation,
        onInteract: (workstationId: string) => void,
    ) {
        super(scene, x, y);

        this.workstationId = workstation.id;
        this.onInteract = onInteract;

        this.bodyShape = scene.add.rectangle(0, 0, 50, 50, 0x000000);

        const nameText = scene.add.text(
            0,
            -35,
            workstation.name,
            {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#49382e',
            },
        );

        nameText.setOrigin(0.5);

        this.statusText = scene.add.text(
            0,
            35,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#49382e',
            },
        );

        this.statusText.setOrigin(0.5);

        this.add([
            this.bodyShape,
            nameText,
            this.statusText,
        ]);

        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -25,
                -25,
                50,
                50,
            ),
            Phaser.Geom.Rectangle.Contains,
        );

        this.on('pointerdown', this.handlePointerDown, this);

        scene.add.existing(this);

        this.render(workstation);
    }

    private handlePointerDown(): void {
        this.onInteract(this.workstationId);
    }

    render(workstation: Workstation): void {
        this.setPosition(
            workstation.position.x,
            workstation.position.y,
        );

        if (workstation.state === this.currentState) {
            return;
        }

        this.currentState = workstation.state;

        switch (workstation.state) {
            case 'waiting_for_cat': {
                this.statusText.setText('Ждёт кота');
                this.bodyShape.setScale(1);
                break;
            }

            case 'idle':
                this.statusText.setText('Ждёт команду');
                this.bodyShape.setScale(1);
                break;

            case 'producing':
                this.statusText.setText('Готовим...');
                this.bodyShape.setScale(1, 0.9);
                break;

            case 'ready':
                this.statusText.setText('Готово!');
                this.bodyShape.setScale(1.1, 1.1);
                break;
        }
    }

    destroy(fromScene?: boolean): void {
        this.off(
            'pointerdown',
            this.handlePointerDown,
            this,
        );

        super.destroy(fromScene);
    }
}
