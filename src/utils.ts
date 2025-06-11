import { AbstractMesh, Color3, DynamicTexture, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

/**
 * 创建动态材质纹理
 * @param scene 场景
 * @param text 文字内容
 * @returns 返回创建的材质对象
 */
const createTextTexture = (scene: Scene, text: string) => {
  const texture = new DynamicTexture("dynamic texture", {width:512, height:256}, scene);   
  const textureContext = texture.getContext();
  
  const material = new StandardMaterial("Mat", scene);    				
  material.diffuseTexture = texture;
  const font = "bold 44px monospace";
  texture.drawText(text, 75, 135, font, "green", "white", true, true);
  return material;
}

/**
 * 创建动态文字纹理
 * @param scene 场景
 * @param text 文字内容
 * @returns 返回创建的纹理对象
 */
const createTexture = (scene: Scene, text: string) => {
  const texture = new DynamicTexture("dynamic texture", {width:512, height:256}, scene);   
  const textureContext = texture.getContext();
  const font = "bold 44px monospace";
  texture.drawText(text, 75, 135, font, "green", "white", true, true);
  return texture;
}

/**
 * 返回带有动态纹理的精灵
 * @param scene 场景
 * @param text 文字内容
 * @param position 位置
 * @param size 大小
 * @returns 
 */
const createSpriteWithDynamicTexture = (scene: Scene, bgColor: string, text: string, position: Vector3, size: number = 0.2) => {
    // 1. 创建动态纹理
    const dynamicTexture = new DynamicTexture(
        `${text}Texture`, 
        { width: 256, height: 256 }, 
        scene
    );
    
    // 2. 在纹理上绘制内容
    const context = dynamicTexture.getContext() as CanvasRenderingContext2D;
    context.fillStyle = bgColor;  // 背景色
    context.fillRect(0, 0, 256, 256);
    
    context.font = 'bold 200px Arial';
    context.fillStyle = 'white';   // 文字颜色
    
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 128);    // 使用计算出的 x 坐标

    dynamicTexture.update();
    // 3. 创建平面网格（作为精灵替代）
    const plane = MeshBuilder.CreatePlane(
        `${text}Sprite`,
        { width: size, height: size },
        scene
    );
    // const plane = MeshBuilder.CreateSphere(`${text}Sprite`, { diameter: size }, scene);
    // 4. 应用材质
    const material = new StandardMaterial(`${text}Material`, scene);
    material.diffuseTexture = dynamicTexture;
    material.emissiveColor = new Color3(0.5, 0.5, 0.5); // 使精灵自发光
    material.specularColor = new Color3(0, 0, 0); // 禁用高光
    material.backFaceCulling = false;
    
    plane.material = material;
    plane.position = position;
    
    // 5. 设置为面向相机（替代精灵的自动面向特性）
    plane.billboardMode = AbstractMesh.BILLBOARDMODE_ALL;
    
    return plane;
}

const hslToRGB = (h: number, s: number, l: number) => {
    // 色调范围是 [0, 360]，饱和度和亮度范围是 [0, 1]
    s = s / 100;
    l = l / 100;
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const X = C * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - C / 2;
  
    let r, g, b;
    if (h >= 0 && h < 60) {
      r = C; g = X; b = 0;
    } else if (h >= 60 && h < 120) {
      r = X; g = C; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = C; b = X;
    } else if (h >= 180 && h < 240) {
      r = 0; g = X; b = C;
    } else if (h >= 240 && h < 300) {
      r = X; g = 0; b = C;
    } else {
      r = C; g = 0; b = X;
    }
    // 转换到 [0, 1] 范围
    r = (r + m);
    g = (g + m);
    b = (b + m);
    // 创建 Color3 对象并返回
    return new Color3(r, g, b);
}

/**
 * 将颜色值转换为 Color3 对象
 * @param colorVal 颜色值
 * @returns 
 */
const colorConversion = (colorVal: string) => {
  let color3 = null
  if(/^rgb/.test(colorVal)) {
    const matches = colorVal.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) as string[];
    color3 = Color3.FromInts(
      parseInt(matches[1]),
      parseInt(matches[2]),
      parseInt(matches[3]),
    )
  }else if (/^#/.test(colorVal)) {
    color3 = Color3.FromHexString(colorVal)
  }else if (/^hsl/.test(colorVal)) {
    const regex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
    const matches = colorVal.match(regex) as string[];
    color3 = hslToRGB(
      parseInt(matches[1]),
      parseInt(matches[2]),
      parseInt(matches[3]),
    )
  }else {
    console.log(`Three is no color format like ${colorVal}`)
  }
  return color3;
}



export { createTextTexture, createTexture, createSpriteWithDynamicTexture, colorConversion };
