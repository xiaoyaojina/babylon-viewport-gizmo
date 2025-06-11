# babylon-viewport-gizmo

A simple Babylon. js perspective preview tool.

## 安装

```bash
npm install babylon-viewport-gizmo
# 或
yarn add babylon-viewport-gizmo
# 或
pnpm add babylon-viewport-gizmo
```

## 功能

This library provides a primary function：

1. `ViewportGizmo`: Camera perspective preview viewer, supporting synchronization between the main scene camera and the small map camera, as well as interactive operation of the small map.

## 使用示例

```typescript
// This is a simple example, you need to pay attention to whether the canvas is mounted successfully!!!
import { ViewportGizmo } from 'babylon-viewport-gizmo';

const mainCanvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const mainEngine = new Engine(mainCanvas, true);

const createMainScene = () => {
  const scene = new Scene(mainEngine);
  const camera = new ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2.5, 20, Vector3.Zero(), scene);
  camera.attachControl(mainCanvas, true);
  const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
  const box = MeshBuilder.CreateBox('box', { size: 2 }, scene);
  const xAxer = new AxesViewer(scene, 2);
  return { scene, camera };
};
const { scene, camera } = createMainScene()

mainEngine.runRenderLoop(() => {
  scene.render();
});

new ViewportGizmo(camera)
```

## 类与方法详情

### `ViewportGizmo` 类

`A 3D camera orientation controller that provides a visual interface for manipulating the camera's viewing angle. The widget displays the current camera orientation and allows users to adjust the view directly by clicking or dragging.`

#### 构造函数

```typescript
constructor(mainCamera: ArcRotateCamera)
```
- `mainCamera`: Camera of the main scene for Gizmo control.

#### 方法
- `setCanvasPosition(x: number | string, y: number | string)`: Set the position of the canvas.
- `setCanvasSize(width: number | string, height: number | string)`: Set the size of the canvas.
- `setBackgroundColor(color: string)`: Set the background color of the small map scene.
- `changeCamera(camera: ArcRotateCamera)`: Change the camera that the gizmo controls.
- `onResize()`: Adjust the engine size to adapt to changes in the canvas.
- `renderer()`: Start rendering loop.
- `dispose()`: Release all resources and remove them canvas.

## 效果

![](https://github.com/xiaoyaojina/babylon-viewport-gizmo/blob/main/image.png)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（监视文件变化）
pnpm dev

# 构建项目
pnpm build

# 运行类型检查
pnpm lint
```

## 本地调试

你可以使用pnpm link将此库链接到本地项目中进行调试：

```bash
# 在库项目目录中创建全局链接
pnpm link --global

# 在你的应用项目中使用该链接
cd /path/to/your/project
pnpm link --global babylon-viewport-gizmo

# 现在你可以在项目中导入并使用该库，所有修改将直接生效

# 完成调试后，可以移除链接
pnpm unlink babylon-viewport-gizmo
# 如果需要恢复使用npm版本
pnpm install babylon-viewport-gizmo
```

在进行本地调试前，请确保已运行`pnpm build`以生成最新的构建文件。

## 发布

```bash
# 发布补丁版本(0.0.x)
pnpm release:patch

# 发布次要版本(0.x.0)
pnpm release:minor

# 发布主要版本(x.0.0)
pnpm release:major
```

## 许可证

MIT
