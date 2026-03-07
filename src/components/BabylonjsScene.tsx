import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
// 關鍵修正 1：明確導入 Loader 模組，避免二進制解析失敗
import "@babylonjs/loaders/glTF/2.0/glTFLoader"; 

// 1. 包含雜訊位移擾動的 Vertex Shader
const pointCloudVertexShader = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    uniform float perspectiveFactor;
    uniform vec2 mousePos;
    uniform float time;
    varying float vAlpha;
    varying vec3 vColor;

    // --- Simplex Noise 核心演算法 (移植自 main.js) ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main(void) {
        vec4 screenPos = worldViewProjection * vec4(position, 1.0);
        vec2 normalizedScreenPos = (screenPos.xy / screenPos.w) * 0.5 + 0.5;
        
        // 1. 計算雜訊與滑鼠距離
        float mouseNoiseStrength = 0.4;
        float noiseValue = snoise(normalizedScreenPos * 2.0 + time * 0.3);
        float distToMouse = distance(normalizedScreenPos, mousePos) + noiseValue * mouseNoiseStrength;
        
        // 2. 核心修正：邏輯反轉 (滑鼠範圍內 strength 為 0，範圍外為 1)
        // 這裡設定在 0.15 內完全不變動，0.35 外完全擾動
        float strength = smoothstep(0.25, 0.45, distToMouse);
        
        // 3. 核心修正：位移量縮小 10 倍 (原本 50~60 -> 改為 5.0)
        vec3 finalPosition = position;
        float maxDisplacement = 0.15; 
        float noiseFrequency = 0.05;
        
        float dx = snoise(position.yz * noiseFrequency + time * 0.4);
        float dy = snoise(position.xz * noiseFrequency + time * 0.4);
        float dz = snoise(position.xy * noiseFrequency + time * 0.4);
        vec3 displacement = normalize(vec3(dx, dy, dz)) * maxDisplacement;
        
        // 套用位移：滑鼠附近會乘以 0 (不動)，遠處乘以 1 (擾動)
        finalPosition += displacement * strength;

        // 4. 顏色與大小邏輯保持
        float highlight = 1.0 - smoothstep(0.1, 0.4, distToMouse);
        float edgeNoise = smoothstep(0.1, 0.5, distToMouse);
        vColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.6, 1.0), edgeNoise);
        vAlpha = mix(0.15, 0.85, highlight);

        gl_Position = worldViewProjection * vec4(finalPosition, 1.0);
        float baseSize = perspectiveFactor / gl_Position.w;
        gl_PointSize = clamp(baseSize * (1.0 + highlight), 0.3, 2.3);
    }
`;

const pointCloudFragmentShader = `
    precision highp float;
    varying float vAlpha;
    varying vec3 vColor;
    void main(void) {
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        float softEdge = 1.0 - smoothstep(0.3, 0.5, r);
        gl_FragColor = vec4(vColor, vAlpha * softEdge);
    }
`;

// 建立一個紀錄點位的 Map
const navDataMap = new Map<string, { loc?: BABYLON.Vector3, target?: BABYLON.Vector3 }>();

export default function BabylonjsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.05, 1);

    // 初始相機設定 (對準 sitecam.glb 座標)
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 20, new BABYLON.Vector3(-10, 0, -5), scene);
    camera.attachControl(canvasRef.current, true);

    const globalMousePos = new BABYLON.Vector2(0.5, 0.5);
    const onUpdateMouse = (e: any) => {
        globalMousePos.x = e.detail.x;
        globalMousePos.y = 1.0 - e.detail.y;
    };
    window.addEventListener('updateMouse', onUpdateMouse);

    const shaderMaterials: BABYLON.ShaderMaterial[] = [];

    // 關鍵修正 2：定義 Shader 建立函數
    const setupPCShader = (meshName: string) => {
      const mat = new BABYLON.ShaderMaterial("pcShader_" + meshName, scene, {
        vertexSource: pointCloudVertexShader,
        fragmentSource: pointCloudFragmentShader,
      }, {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "perspectiveFactor", "mousePos", "time"]
      });
      
      // 這裡控制點的大小靈敏度，2000 左右會讓點看起來很精細
      mat.setFloat("perspectiveFactor", 2200.0); 
      mat.fillMode = BABYLON.Material.PointFillMode;
      
      // 關鍵：使用 ALPHA_ADD 讓光點堆疊時會發光
      mat.alphaMode = BABYLON.Engine.ALPHA_ADD; 
      mat.needAlphaBlending = () => true;
      
      shaderMaterials.push(mat);
      return mat;
    };

    // 關鍵修正 3：使用路徑與檔名分離的載入方式
    console.log("PC_LOG: Attempting to load sitecam.glb...");

    const modelPath = `${import.meta.env.BASE_URL}models/`;

    BABYLON.SceneLoader.ImportMeshAsync("", modelPath, "sitecam.glb", scene)
      .then((result) => {
        console.log("PC_LOG: GLB Load Success. Meshes:", result.meshes.length);
        

        result.meshes.forEach(mesh => {

          // 1. 識別 loc 與 target 物件
          const locMatch = mesh.name.match(/^c(\d+)_loc$/);
          const targetMatch = mesh.name.match(/^c(\d+)_target$/);
          
          let id = null;
          let type: 'loc' | 'target' | '' = '';
          
          if (locMatch) { id = locMatch[1]; type = 'loc'; }
          else if (targetMatch) { id = targetMatch[1]; type = 'target'; }
          
          // 修正點 B: 只有當 id 與 type 都有值時才進行索引存取
          if (id && type) {
            if (!navDataMap.has(id)) {
              navDataMap.set(id, {});
            }
            
            // 現在 TypeScript 知道 type 只能是 'loc' 或 'target'
            const entry = navDataMap.get(id)!;
            entry[type] = mesh.getAbsolutePosition().clone();
            
            mesh.isVisible = false;
            mesh.setEnabled(false); // 導航物件不參與渲染與採樣
            return;
          }

          if (mesh instanceof BABYLON.Mesh && mesh.getTotalVertices() > 0) {
            mesh.isVisible = false; 

            // 執行移植的點雲採樣
            const pointData = generatePointDataOnMesh(mesh, 40000); 
            if (pointData) {
              const pcMesh = new BABYLON.Mesh("pc_" + mesh.name, scene);
              const vertexData = new BABYLON.VertexData();
              vertexData.positions = pointData.positions;
              vertexData.uvs = pointData.uvs;
              vertexData.indices = Array.from({ length: pointData.positions.length / 3 }, (_, i) => i);
              vertexData.applyToMesh(pcMesh);
              pcMesh.material = setupPCShader(mesh.name);
            }
          }

          // 預設初始視角動畫 (如果有 c0)
          if (navDataMap.has("0")) {
            const start = navDataMap.get("0")!;
            if (start.loc && start.target) {
              camera.position = start.loc;
              camera.setTarget(start.target);
            }
          }

        });

        // 3. 實作相機切換事件監聽
        const onJumpToView = (e: any) => {
          const viewId = e.detail; // 例如 "1", "2"
          const viewData = navDataMap.get(viewId);
          if (viewData && viewData.loc && viewData.target) {
            // 執行平滑相機動畫
            createCameraAnimation(camera, viewData.loc, viewData.target, scene);
          }
        };
        window.addEventListener('jumpToView', onJumpToView);

      })
      .catch(err => {
        console.error("PC_LOG: Load Failed. Check if file is in public/models/", err);
      });

    let time = 0;
    engine.runRenderLoop(() => {
      time += engine.getDeltaTime() / 1000;
      shaderMaterials.forEach(mat => {
        mat.setFloat("time", time);
        mat.setVector2("mousePos", globalMousePos);
      });
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('updateMouse', onUpdateMouse);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      // 診斷完畢後改回 -z-20 即可
      // 診斷完畢：現在改回底層
      className="fixed top-0 left-0 w-full h-full z-[10] pointer-events-none" 
      id="renderCanvas"
      style={{ display: 'block', background: 'black' }}
    />
  );
}

// 輔助採樣函數 (移植自 main.js)
function generatePointDataOnMesh(mesh: BABYLON.Mesh, pointCount: number) {
    mesh.computeWorldMatrix(true);
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
    const indices = mesh.getIndices();
    if (!positions || !indices || !uvs) return null;

    const triangleAreas = [];
    let totalArea = 0;
    for (let i = 0; i < indices.length; i += 3) {
        const p1 = BABYLON.Vector3.FromArray(positions, indices[i] * 3);
        const p2 = BABYLON.Vector3.FromArray(positions, indices[i + 1] * 3);
        const p3 = BABYLON.Vector3.FromArray(positions, indices[i + 2] * 3);
        const area = BABYLON.Vector3.Cross(p2.subtract(p1), p3.subtract(p1)).length() / 2;
        totalArea += area;
        triangleAreas.push({ index: i, cumulative: totalArea });
    }
    if (totalArea === 0) return null;

    const pointPositions: number[] = [];
    const pointUVs: number[] = [];
    const worldMatrix = mesh.getWorldMatrix();
    for (let i = 0; i < pointCount; i++) {
        const randomArea = Math.random() * totalArea;
        const pickedTriangle = triangleAreas.find(t => t.cumulative >= randomArea);
        if (!pickedTriangle) continue;
        const faceIndex = pickedTriangle.index;
        const i1 = indices[faceIndex], i2 = indices[faceIndex+1], i3 = indices[faceIndex+2];
        const v1 = BABYLON.Vector3.FromArray(positions, i1 * 3);
        const v2 = BABYLON.Vector3.FromArray(positions, i2 * 3);
        const v3 = BABYLON.Vector3.FromArray(positions, i3 * 3);
        const uv1 = BABYLON.Vector2.FromArray(uvs, i1 * 2);
        const uv2 = BABYLON.Vector2.FromArray(uvs, i2 * 2);
        const uv3 = BABYLON.Vector2.FromArray(uvs, i3 * 2);
        let r1 = Math.random(), r2 = Math.random();
        if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
        const a = 1 - r1 - r2, b = r1, c = r2;
        const randomPointPos = v1.scale(a).add(v2.scale(b)).add(v3.scale(c));
        const randomPointUV = uv1.scale(a).add(uv2.scale(b)).add(uv3.scale(c));
        const worldPos = BABYLON.Vector3.TransformCoordinates(randomPointPos, worldMatrix);
        pointPositions.push(worldPos.x, worldPos.y, worldPos.z);
        pointUVs.push(randomPointUV.x, randomPointUV.y);
    }
    return { positions: pointPositions, uvs: pointUVs };
}

function createCameraAnimation(camera: BABYLON.ArcRotateCamera, newPos: BABYLON.Vector3, newTarget: BABYLON.Vector3, scene: BABYLON.Scene) {
  const frameRate = 30;
  const duration = 2.0; // 2 秒的平滑過渡
  const totalFrames = frameRate * duration;

  const posAnim = new BABYLON.Animation("camPos", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  posAnim.setKeys([{ frame: 0, value: camera.position.clone() }, { frame: totalFrames, value: newPos }]);

  const targetAnim = new BABYLON.Animation("camTarget", "target", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  targetAnim.setKeys([{ frame: 0, value: camera.getTarget().clone() }, { frame: totalFrames, value: newTarget }]);

  // 使用三次貝茲曲線達到平滑減速效果
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  posAnim.setEasingFunction(easing);
  targetAnim.setEasingFunction(easing);

  scene.beginDirectAnimation(camera, [posAnim, targetAnim], 0, totalFrames, false);
}