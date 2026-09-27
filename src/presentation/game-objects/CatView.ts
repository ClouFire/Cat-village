import * as Phaser from 'phaser';

import type { Cat } from '../../domain/entities/Cat';

export class CatView extends Phaser.GameObjects.Container {
    private readonly bodyShape: Phaser.GameObjects.Ellipse;
    private readonly statusText: Phaser.GameObjects.Text;
    private readonly onInteract: (catId: string) => void;
    private readonly catId: string;
    private currentState: Cat['state'] | null = null;

    constructor (
        scene: Phaser.Scene,
        x: number,
        y: number,
        cat: Cat,
        onInteract: (catId: string) => void,
    ) {
        super(scene, x, y);

        this.catId = cat.id;
        this.onInteract = onInteract;

        const leftEar = scene.add.triangle(-22, -34, 0, 30, 24, 0, 48, 30, 0xf2b46d,);

        const rightEar = scene.add.triangle(22, -34, 0, 30, 24, 0, 48, 30, 0xf2b46d,);

        this.bodyShape = scene.add.ellipse(0, 0, 100, 85, 0xf2b46d,);

        const leftEye = scene.add.ellipse(-17, -8, 7, 11, 0x49382e,);

        const rightEye = scene.add.ellipse(17, -8, 7, 11, 0x49382e,);

        const nose = scene.add.triangle(0, 7, 0, 0, 10, 0, 5, 6, 0xd88985,);

        const nameText = scene.add.text(
            0, 
            -80, 
            cat.name,
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#49382e',
            },
        );

        nameText.setOrigin(0.5);

        this.statusText = scene.add.text(0, 65, '', {fontFamily: 'Arial', fontSize: '15px', color: '#49382e'});
        this.statusText.setOrigin(0.5);

        this.add([
            leftEar,
            rightEar,
            this.bodyShape,
            leftEye,
            rightEye,
            nose,
            nameText,
            this.statusText,
        ]);

        this.setSize(120, 120);

        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -60,
                -60,
                120,
                120,
            ),
            
            Phaser.Geom.Rectangle.Contains,
        );

        this.on('pointerdown', this.handlePointerDown, this);

        scene.add.existing(this);

        this.render(cat);
    }

    private handlePointerDown(): void {
        this.onInteract(this.catId);
    }

    render(cat: Cat): void {
        this.setPosition(
            cat.position.x,
            cat.position.y
        );

        if (cat.state === this.currentState) {
            return;
        }

        this.currentState = cat.state;

        switch (cat.state) {
            case 'moving':
                this.statusText.setText('Идёт');
                this.setScale(1);
                break;
            case 'resting':
                this.statusText.setText('Отдыхает');
                this.setScale(1, 0.9);
                break;
            case 'idle':
                this.statusText.setText('Ждёт');
                this.setScale(1);
                break;
            case 'cooking':
                this.statusText.setText('');
                this.setScale(0);
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