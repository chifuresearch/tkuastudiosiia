import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders/glTF/2.0/glTFLoader"; 

// 1. 穩定版蒸發 Shader
const pointCloudVertexShader = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    uniform mat4 view;
    uniform float perspectiveFactor;
    uniform vec2 mousePos;
    uniform float time;
    varying float vAlpha;
    varying vec3 vColor;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

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
        vec4 viewPos = view * vec4(position, 1.0);
        float distToCamera = -viewPos.z;
        float nearBlur = smoothstep(1.0, 0.0, distToCamera);
        float farFade = 1.0 - smoothstep(25.0,35.0, distToCamera);

        vec4 screenPos = worldViewProjection * vec4(position, 1.0);
        vec2 normalizedScreenPos = (screenPos.xy / screenPos.w) * 0.5 + 0.5;
        float interaction = 1.0 - smoothstep(0.0, 0.15, distance(normalizedScreenPos, mousePos));

        // 蒸發循環
        float speed = 0.3 + random(position.xy) * 0.7;
        float lifeSpan = 2.0;
        float offset = mod(time * speed + position.y, lifeSpan);
        float progress = offset / lifeSpan;
        
        float jitter = snoise(position.xz * 0.1 + time * 0.1) * progress * 0.5;
        vec3 displacement = vec3(jitter, offset, jitter) * interaction;
        vec3 finalPos = position + displacement;

        gl_Position = worldViewProjection * vec4(finalPos, 1.0);

        float baseSize = perspectiveFactor / gl_Position.w;
        // 稍微調大點的大小
        gl_PointSize = baseSize * (0.5 - progress * 0.3 + interaction * 2.5);
        gl_PointSize = clamp(gl_PointSize, 0.3, 7.0);

        vec3 cBlue = vec3(1.0, 0.37, 0.0);
        vec3 cOrange = vec3(0, 0.83, 1.0);
        vec3 cGreen = vec3(0.13, 0.77, 0.36);
        
        vec3 colorMix = mix(cGreen, cOrange, progress);
        vColor = mix(colorMix, cBlue, interaction);
        
        float lifeAlpha = 1.0 - smoothstep(0.55, 1.0, progress); 
        vAlpha = mix(0.15, 0.8, interaction) * lifeAlpha * farFade;
    }
`;

const pointCloudFragmentShader = `
    precision highp float;
    varying float vAlpha;
    varying vec3 vColor;
    void main(void) {
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        float mask = smoothstep(0.5, 0.2, r); 
        float glow = pow(1.0 - (r * 2.0), 2.0);
        gl_FragColor = vec4(vColor * (glow + 0.6) * 2.2, vAlpha * mask);
    }
`;

const navDataMap = new Map<string, { loc?: BABYLON.Vector3, target?: BABYLON.Vector3 }>();

export default function BabylonjsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isAnimatingRef = useRef(false); // 修正 1：補回遺漏的 Ref 定義

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 25, new BABYLON.Vector3(-10, 0, -5), scene);
    camera.attachControl(canvasRef.current, true);
    let baseTarget = camera.getTarget().clone();

    const globalMousePos = new BABYLON.Vector2(0.5, 0.5);
    const onUpdateMouse = (e: any) => {
        globalMousePos.x = e.detail.x;
        globalMousePos.y = 1.0 - e.detail.y;
        
        // 只有在非動畫狀態下才執行探頭偏移
        if (!isAnimatingRef.current) {
            const offsetX = (e.detail.x - 0.5) * 4.0;
            const offsetY = (e.detail.y - 0.5) * 2.0;
            camera.setTarget(baseTarget.add(new BABYLON.Vector3(offsetX, -offsetY, 0)));
        }
    };
    window.addEventListener('updateMouse', onUpdateMouse);

    const shaderMaterials: BABYLON.ShaderMaterial[] = [];
    const setupPCShader = (meshName: string) => {
      const mat = new BABYLON.ShaderMaterial("pcShader_" + meshName, scene, {
        vertexSource: pointCloudVertexShader,
        fragmentSource: pointCloudFragmentShader,
      }, {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "view", "perspectiveFactor", "mousePos", "time"]
      });
      mat.setFloat("perspectiveFactor", 2200.0); 
      mat.fillMode = BABYLON.Material.PointFillMode;
      mat.alphaMode = BABYLON.Engine.ALPHA_ADD; 
      mat.needAlphaBlending = () => true;
      shaderMaterials.push(mat);
      return mat;
    };

    const modelPath = `${import.meta.env.BASE_URL}models/`;
    BABYLON.SceneLoader.ImportMeshAsync("", modelPath, "sitecam.glb", scene)
      .then((result) => {
        result.meshes.forEach(mesh => {
          const locMatch = mesh.name.match(/^c(\d+)_loc$/);
          const targetMatch = mesh.name.match(/^c(\d+)_target$/);
          if (locMatch || targetMatch) {
            const id = locMatch ? locMatch[1] : targetMatch![1];
            const type = locMatch ? 'loc' : 'target';
            if (!navDataMap.has(id)) navDataMap.set(id, {});
            navDataMap.get(id)![type] = mesh.getAbsolutePosition().clone();
            mesh.isVisible = false;
            mesh.setEnabled(false);
            return;
          }

          if (mesh instanceof BABYLON.Mesh && mesh.getTotalVertices() > 0) {
            mesh.isVisible = false; 
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
        });

        if (navDataMap.has("0")) {
          const start = navDataMap.get("0")!;
          camera.position = start.loc!;
          camera.setTarget(start.target!);
          baseTarget = start.target!.clone();
        }

        const onJumpToView = (e: any) => {
          const viewData = navDataMap.get(e.detail);
          if (viewData?.loc && viewData?.target) {
            isAnimatingRef.current = true;
            baseTarget = viewData.target.clone();
            createCameraAnimation(camera, viewData.loc, viewData.target, scene, () => {
              isAnimatingRef.current = false;
            });
          }
        };
        window.addEventListener('jumpToView', onJumpToView);
      });

    let time = 0;
    engine.runRenderLoop(() => {
      time += engine.getDeltaTime() / 1000;
      shaderMaterials.forEach(mat => {
        mat.setFloat("time", time);
        mat.setVector2("mousePos", globalMousePos);
        mat.setMatrix("view", scene.getViewMatrix());
      });
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('updateMouse', onUpdateMouse);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" style={{ background: 'black' }} />;
}

// 輔助函數區
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
    const pointPositions: number[] = [];
    const pointUVs: number[] = [];
    const worldMatrix = mesh.getWorldMatrix();
    for (let i = 0; i < pointCount; i++) {
        const randomArea = Math.random() * totalArea;
        const pickedTriangle = triangleAreas.find(t => t.cumulative >= randomArea);
        if (!pickedTriangle) continue;
        const fI = pickedTriangle.index;
        const v1 = BABYLON.Vector3.FromArray(positions, indices[fI] * 3);
        const v2 = BABYLON.Vector3.FromArray(positions, indices[fI+1] * 3);
        const v3 = BABYLON.Vector3.FromArray(positions, indices[fI+2] * 3);
        const uv1 = BABYLON.Vector2.FromArray(uvs, indices[fI] * 2);
        const uv2 = BABYLON.Vector2.FromArray(uvs, indices[fI+1] * 2);
        const uv3 = BABYLON.Vector2.FromArray(uvs, indices[fI+2] * 2);
        let r1 = Math.random(), r2 = Math.random();
        if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
        const a = 1 - r1 - r2, b = r1, c = r2;
        const pos = v1.scale(a).add(v2.scale(b)).add(v3.scale(c));
        const uv = uv1.scale(a).add(uv2.scale(b)).add(uv3.scale(c));
        const wPos = BABYLON.Vector3.TransformCoordinates(pos, worldMatrix);
        pointPositions.push(wPos.x, wPos.y, wPos.z);
        pointUVs.push(uv.x, uv.y);
    }
    return { positions: pointPositions, uvs: pointUVs };
}

function createCameraAnimation(camera: BABYLON.ArcRotateCamera, newPos: BABYLON.Vector3, newTarget: BABYLON.Vector3, scene: BABYLON.Scene, onEnd: () => void) {
  const frameRate = 30;
  const totalFrames = 60;
  const posAnim = new BABYLON.Animation("camPos", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  posAnim.setKeys([{ frame: 0, value: camera.position.clone() }, { frame: totalFrames, value: newPos }]);
  const targetAnim = new BABYLON.Animation("camTarget", "target", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  targetAnim.setKeys([{ frame: 0, value: camera.getTarget().clone() }, { frame: totalFrames, value: newTarget }]);
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  posAnim.setEasingFunction(easing);
  targetAnim.setEasingFunction(easing);
  scene.beginDirectAnimation(camera, [posAnim, targetAnim], 0, totalFrames, false, 1, onEnd);
}