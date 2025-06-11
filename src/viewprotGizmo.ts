import { ArcRotateCamera, Camera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, Scene,  TransformNode, Vector3 } from "@babylonjs/core"
import { createSpriteWithDynamicTexture, colorConversion } from "./utils";

// needClickMeshs of type
interface ClickMeshs {
    xPlane: Mesh;
    yPlane: Mesh;
    zPlane: Mesh;
    xPlane2: Mesh | undefined;
    yPlane2: Mesh | undefined;
    zPlane2: Mesh | undefined;
}

class ViewportGizmo {
	private _engine: Engine;
	private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _miniCamera: ArcRotateCamera;
    private _mainCamera: ArcRotateCamera;
    private needClickMeshs: ClickMeshs;
    private _clickHandler: ((event: MouseEvent) => void) | null = null;
    private _mainCameraObserver: any = null;
    private _miniCameraObserver: any = null;

    // constructor(private _canvas: HTMLCanvasElement, mainCamera: ArcRotateCamera) {
    constructor(mainCamera: ArcRotateCamera) {
        this._canvas = this.createCanvas();
        this._engine = new Engine(this._canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this._scene = new Scene(this._engine);
        this._miniCamera = new ArcRotateCamera('miniCamera', -Math.PI / 2, Math.PI / 2.5, 20, Vector3.Zero(), this._scene);
        this._miniCamera.attachControl(this._canvas, true);

        this._miniCamera.upperRadiusLimit = 12;
		this._miniCamera.lowerRadiusLimit = 12;

        this._mainCamera = mainCamera;
        this.createHemisphericLight(this._scene)
        this.createBox(this._scene)
        const { xNode, yNode, zNode, xPlane, yPlane, zPlane, xPlane2, yPlane2, zPlane2 } = this.createAxis(this._scene)
        this.needClickMeshs = {
            xPlane, yPlane, zPlane, xPlane2, yPlane2, zPlane2
        }
        this.onResize()
        this.mainToMini()
        setTimeout(() => {
            this.miniToMain()
        }, 0)
        this.miniInteraction(this._canvas, this._scene)
        this.renderer()
    }

    private createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'viewportGizmo';
        canvas.style.width = '200px';
        canvas.style.height = '200px';
        canvas.style.position = 'absolute';
        canvas.style.bottom = '20px';
        canvas.style.right = '20px';
        canvas.style.zIndex = '9999';
        canvas.style.touchAction = 'none';
        canvas.style.borderRadius = '100%';

        canvas.addEventListener('focus', () => {
            canvas.style.border = '2px solid #ccc';
        });
        canvas.addEventListener('blur', () => {
            canvas.style.border = '2px solid transparent';
        });
        
        document.body.appendChild(canvas);
        return canvas;
    }

    private createHemisphericLight(scene: Scene) {
        const light = new HemisphericLight('miniLight', new Vector3(1, 1, 0), scene);
    }

    private createBox(scene: Scene) {
        const box = MeshBuilder.CreateBox('box', { size: 1.5 }, scene);
    }

    private createZSQ(scene: Scene, bgColor: string, text: string, position: Vector3, size: number = 0.2){
	    let plane2;
        // Create direction
        const node = new TransformNode('directionGroup', scene);
        node.position.y = 1.5;
        const cylinder = MeshBuilder.CreateCylinder('sp', { diameterTop: 0.2, diameterBottom: 0.2, height: 3 }, scene);
        cylinder.parent = node;
        const plane = createSpriteWithDynamicTexture(scene, bgColor, text, position, size);
        plane.parent = node;
        // plane.renderingGroupId = 1;
        const n = size - 0.5;
        if (text === 'X') {
            const pos = new Vector3(-position.x - 2.5, -position.y, -position.z);
            plane2 = createSpriteWithDynamicTexture(scene, bgColor, '', pos, n);
            plane2.parent = node;
            plane2.position;
        } else if (text === 'Y') {
            const pos = new Vector3(-position.x, -position.y - 2.5, -position.z);
            plane2 = createSpriteWithDynamicTexture(scene, bgColor, '', pos, n);
            plane2.parent = node;
            plane2.position;
        } else if (text === 'Z') {
            const pos = new Vector3(-position.x, -position.y, -position.z - 2.5);
            plane2 = createSpriteWithDynamicTexture(scene, bgColor, '', pos, n);
            plane2.parent = node;
        }
        if (plane2 && plane2.material) {
            plane2.material.alpha = 0.5;
        }
        return { node, plane, plane2 };
    };

    private createAxis(scene: Scene) {
        const { node: xNode, plane: xPlane, plane2: xPlane2 } = this.createZSQ(scene, Color3.Red().toHexString(), 'X', new Vector3(2.2, 0, 0), 1.2);
		xNode.position.x = 1.5;
		xNode.position.y = 0;
		xNode.rotation.z = Math.PI / 2;

		const { node: yNode, plane: yPlane, plane2: yPlane2 } = this.createZSQ(scene, Color3.Green().toHexString(), 'Y', new Vector3(0, 2.2, 0), 1.2);

		const { node: zNode, plane: zPlane, plane2: zPlane2 } = this.createZSQ(scene, Color3.Blue().toHexString(), 'Z', new Vector3(0, 0, 2.2), 1.2);
		zNode.position.z = 1.5;
		zNode.position.y = 0;
		zNode.rotation.x = Math.PI / 2;

        return { xNode, yNode, zNode, xPlane, yPlane, zPlane, xPlane2, yPlane2, zPlane2 };
    }

    // main scene to the minicamera
    private mainToMini() {
        this.removeMainCameraListener();
        
        this._mainCameraObserver = this._mainCamera.onViewMatrixChangedObservable.add(() => {
            this._miniCamera.alpha = this._mainCamera.alpha;
            this._miniCamera.beta = this._mainCamera.beta;
        });
    }

    // minicamera to the main scene
    private miniToMain() {
        this.removeMiniCameraListener();
        
        this._miniCameraObserver = this._miniCamera.onViewMatrixChangedObservable.add(() => {
            this._mainCamera.alpha = this._miniCamera.alpha;
            this._mainCamera.beta = this._miniCamera.beta;
        });
    }

     private removeMainCameraListener() {
        if (this._mainCameraObserver && this._mainCamera.onViewMatrixChangedObservable) {
            this._mainCamera.onViewMatrixChangedObservable.remove(this._mainCameraObserver);
            this._mainCameraObserver = null;
        }
    }

     private removeMiniCameraListener() {
        if (this._miniCameraObserver && this._miniCamera.onViewMatrixChangedObservable) {
            this._miniCamera.onViewMatrixChangedObservable.remove(this._miniCameraObserver);
            this._miniCameraObserver = null;
        }
    }

    // Mini map interaction
    private miniInteraction(canvas: HTMLCanvasElement, scene: Scene) {
        // Save the bound event handling function
        this._clickHandler = (event: MouseEvent) => {
            const pickResult = scene.pick(event.offsetX, event.offsetY);
            if (pickResult.hit) {
                const pickMesh = pickResult.pickedMesh;
                const pos = this._mainCamera.position;
                const target = this._mainCamera.target;
                // Calculate the distance from the current camera to the target point
                const distance = Vector3.Distance(pos, target);
                switch (pickMesh) {
                    case this.needClickMeshs.xPlane:
                        this._mainCamera.setPosition(new Vector3(target.x + distance, target.y, target.z));
                        this._mainCamera.setTarget(target);
                        break;
                    case this.needClickMeshs.yPlane:
                        this._mainCamera.setPosition(new Vector3(target.x, target.y + distance, target.z));
                        this._mainCamera.setTarget(target);
                        break;
                    case this.needClickMeshs.zPlane:
                        this._mainCamera.setPosition(new Vector3(target.x, target.y, target.z + distance));
                        this._mainCamera.setTarget(target);
                        break;
                    case this.needClickMeshs.xPlane2:
                        this._mainCamera.setPosition(new Vector3(target.x - distance, target.y, target.z));
                        this._mainCamera.setTarget(target);
                        break;
                    case this.needClickMeshs.yPlane2:
                        this._mainCamera.setPosition(new Vector3(target.x, target.y - distance, target.z));
                        this._mainCamera.setTarget(target);
                        break;
                    case this.needClickMeshs.zPlane2:
                        this._mainCamera.setPosition(new Vector3(target.x, target.y, target.z - distance));
                        this._mainCamera.setTarget(target);
                        break;
                    default:
                        break;
                }
            }
        };
        canvas.addEventListener('click', this._clickHandler);
    }

    // set canvas position
    setCanvasPosition(x: number | string, y: number | string) {
        this._canvas.style.left = `${x}px`;
        this._canvas.style.top = `${y}px`;
    }

    // Set canvas size
    setCanvasSize(width: number | string, height: number | string) {
        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;
        // Ensure canvas repainting
        this.onResize(); 
        // Re bind event
        if (this._clickHandler) {
            this._canvas.removeEventListener('click', this._clickHandler);
        }
        this.miniInteraction(this._canvas, this._scene);
    }

    // set background scene
    setBackgroundColor(color: string) {
        const colorStr = colorConversion(color);
        if(colorStr) {
            this._scene.clearColor = new Color4(colorStr.r, colorStr.g, colorStr.b, 1);
        }
    }

    // change current camera
    changeCamera(camera: ArcRotateCamera) {
        this.removeMainCameraListener();
        this.removeMiniCameraListener();
        this._mainCamera = camera;
        this.mainToMini();
        this.miniToMain();
        
        this._miniCamera.alpha = camera.alpha;
        this._miniCamera.beta = camera.beta;
    }

    onResize() {
        this._engine.resize();
    }

    renderer() {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        })
    }

    dispose() {
        this.removeMainCameraListener();
        this.removeMiniCameraListener();
        if (this._clickHandler) {
            this._canvas.removeEventListener('click', this._clickHandler);
            this._clickHandler = null;
        }
        this._engine.dispose();
        this._scene.dispose();
        this._canvas.remove();
        this._miniCamera.dispose();
    }
}

export { ViewportGizmo }
