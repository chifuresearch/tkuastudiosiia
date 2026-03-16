import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/loaders/glTF/2.0/glTFLoader"; 

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
        vec3 m = max(0.3 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.2;
        vec3 ox = floor(x + 0.2);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 110.0 * dot(m, g);
    }

void main(void) {
        // 1. 基礎投影與景深修正
        vec4 viewPos = view * vec4(position, 1.0);
        float distToCamera = -viewPos.z;
        float farFade = 1.0 - smoothstep(10.0, 35.0, distToCamera);

        vec4 screenPos = worldViewProjection * vec4(position, 1.0);
        vec2 normalizedScreenPos = (screenPos.xy / screenPos.w) * 0.5 + 0.5;
        
        // 2. 強化撕裂演算法：混合多重頻率雜訊
        float f1 = snoise(normalizedScreenPos * 3.5 + time * 0.3);      
        float f2 = snoise(normalizedScreenPos * 12.0 - time * 0.6) * 0.5; 
        float f3 = snoise(normalizedScreenPos * 25.0 + time * 1.3) * 0.2; 
        
        float fractalDist = distance(normalizedScreenPos, mousePos);
        float tearing = (f1 + f2 + f3) * 0.25; 
        float ruggedField = fractalDist + tearing;
        
        // 作用範圍縮小且破碎化
        float interaction = 1.0 - smoothstep(0.0, 0.12, ruggedField);

        // 3. 噴湧動態與高度循環
        float flowNoise = snoise(position.xz * 0.12 + time * 0.2);
        float speed = 0.25 + random(position.xy) * 0.5;
        float lifeSpan = 2.8 + f1 * 1.2; 
        float offset = mod(time * speed + position.y, lifeSpan);
        float progress = offset / lifeSpan;
        
        vec3 displacement = vec3(flowNoise * 0.2, offset, flowNoise * 0.25) * interaction;
        vec3 finalPos = position + displacement;

        gl_Position = worldViewProjection * vec4(finalPos, 1.0);

        // 4. 點的大小隨交互縮放
        float baseSize = perspectiveFactor / gl_Position.w;
        gl_PointSize = baseSize * (1.0 + interaction * 4.5);
        gl_PointSize = clamp(gl_PointSize, 0.4, 6.5);

        // --- 5. 顏色修正：找回消失的 Cyan 並與 Pink/Orange 融合 ---
        vec3 cCyan = vec3(0.0, 0.85, 1.0);     // 電光藍
        vec3 cPink = vec3(1.0, 0.25, 0.6);    // 霓虹粉
        vec3 cPurple = vec3(0.3, 0.05, 0.8);  // 深邃紫
        vec3 cOrange = vec3(1.0, 0.45, 0.05); // 核心橘
        vec3 cGold = vec3(1.0, 0.8, 0.3);     // 邊緣過渡金
        
        // 重新分配底板權重：強制藍、粉、紫三者交替
        // 利用 sin 與雜訊交叉控制，確保顏色不會只剩一種
        float colorSwitch = sin(position.x * 0.2 + time * 0.5) * 0.5 + 0.5;
        vec3 baseMix = mix(cCyan, cPink, colorSwitch);
        // 加入深紫色的陰影流動
        float purpleFlow = snoise(position.xy * 0.05 - time * 0.15);
        vec3 baseWithShadow = mix(baseMix, cPurple, clamp(purpleFlow, 0.0, 1.0) * 0.4);
        
        // 核心融合邏輯：讓橘色滲透進底色中
        // 加入金色邊界過渡，解決直接變橘色的突兀感
        float bleed = clamp(interaction + f2 * 0.4, 0.0, 1.0);
        vec3 colorWithTransition = mix(baseWithShadow, cGold, bleed * 0.5);
        vColor = mix(colorWithTransition, cOrange, interaction);
        
        // 增加交互時的高頻閃爍 (Voltage Spark)
        vColor += cCyan * f3 * interaction * 0.3;
        
        // 6. 透明度：確保噴湧過程中有明顯的消逝感
        float lifeAlpha = 1.0 - smoothstep(0.4, 0.85, progress); 
        vAlpha = mix(0.18, 0.9, interaction) * lifeAlpha * farFade;
    }
`;

const pointCloudFragmentShader = `
    precision highp float;
    varying float vAlpha;
    varying vec3 vColor;
    void main(void) {
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        float mask = smoothstep(0.5, 0.1, r); 
        float glow = pow(1.0 - (r * 2.0), 2.5);
        gl_FragColor = vec4(vColor * (glow + 0.8) * 3.0, vAlpha * mask);
    }
`;

const navDataMap = new Map<string, { loc?: BABYLON.Vector3, target?: BABYLON.Vector3 }>();

export default function BabylonjsScene() {
const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<BABYLON.Engine | null>(null); // 儲存 engine 引用以利 resize
    const isAnimatingRef = useRef(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canvasRef.current) return;
        // 1. 確保初始化時強迫 Canvas 填滿父容器尺寸
        const engine = new BABYLON.Engine(canvasRef.current, true, { 
            preserveDrawingBuffer: true, 
            stencil: true 
        });
        engineRef.current = engine;

        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 25, new BABYLON.Vector3(-10, 0, -5), scene);
        camera.attachControl(canvasRef.current, true);
        let baseTarget = camera.getTarget().clone();

        const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.1;
        pipeline.bloomWeight = 0.7;
        pipeline.bloomKernel = 64;

        const globalMousePos = new BABYLON.Vector2(0.5, 0.5);
        const onUpdateMouse = (e: any) => {
            globalMousePos.x = e.detail.x;
            globalMousePos.y = 1.0 - e.detail.y;
            if (!isAnimatingRef.current) {
                const offsetX = (e.detail.x - 0.5) * 1.5;
                const offsetY = (e.detail.y - 0.5) * 0.4;
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
        BABYLON.SceneLoader.ImportMeshAsync("", modelPath, "sitecam.glb", scene, (evt) => {
            if (evt.lengthComputable) {
                const loaded = Math.round((evt.loaded * 100) / evt.total);
                setLoadingProgress(loaded);
            }
        }).then((result) => {
            const meshesToProcess = result.meshes.filter(m => {
                const isNav = m.name.includes("_loc") || m.name.includes("_target");
                return !isNav && m instanceof BABYLON.Mesh && m.getTotalVertices() > 0;
            });

            let processedCount = 0;

            // 處理導航節點
            result.meshes.forEach(m => {
                const locMatch = m.name.match(/^c(\d+)_loc$/);
                const targetMatch = m.name.match(/^c(\d+)_target$/);
                if (locMatch || targetMatch) {
                    const id = locMatch ? locMatch[1] : targetMatch![1];
                    const type = locMatch ? 'loc' : 'target';
                    if (!navDataMap.has(id)) navDataMap.set(id, {});
                    navDataMap.get(id)![type] = m.getAbsolutePosition().clone();
                    m.isVisible = false;
                    m.setEnabled(false);
                }
            });

            if (meshesToProcess.length === 0) {
                setIsLoading(false);
            } else {
                meshesToProcess.forEach((mesh, index) => {
                    mesh.isVisible = false;
                    setTimeout(() => {
                        const pointData = generatePointDataOnMesh(mesh as BABYLON.Mesh, 35000);
                        if (pointData) {
                            const pcMesh = new BABYLON.Mesh("pc_" + mesh.name, scene);
                            const vertexData = new BABYLON.VertexData();
                            vertexData.positions = pointData.positions;
                            vertexData.uvs = pointData.uvs;
                            vertexData.indices = Array.from({ length: pointData.positions.length / 3 }, (_, i) => i);
                            vertexData.applyToMesh(pcMesh);
                            pcMesh.material = setupPCShader(mesh.name);
                        }
                        processedCount++;
                        if (processedCount >= meshesToProcess.length) {
                            setTimeout(() => setIsLoading(false), 300);
                        }
                    }, index * 60);
                });
            }

            if (navDataMap.has("0")) {
                const start = navDataMap.get("0")!;
                if (start.loc && start.target) {
                    camera.position = start.loc;
                    camera.setTarget(start.target);
                    baseTarget = start.target.clone();
                }
            }

            const onJumpToView = (e: any) => {
                const viewData = navDataMap.get(e.detail.toString());
                if (viewData?.loc && viewData?.target) {
                    isAnimatingRef.current = true;
                    baseTarget = viewData.target.clone();
                    createCameraAnimation(camera, viewData.loc, viewData.target, scene, () => {
                        isAnimatingRef.current = false;
                    });
                }
            };
            window.addEventListener('jumpToView', onJumpToView);
        }).catch(err => {
            console.error("Model load error:", err);
            setIsLoading(false);
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

        // 3. 強化 Resize 監聽：解決「卡在左上角」的核心問題
        const handleResize = () => {
            if (engineRef.current) {
                engineRef.current.resize();
            }
        };
        // 初次加載後延遲執行一次 resize，確保寬高已完全計算完成
        const timer = setTimeout(handleResize, 100);

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('updateMouse', onUpdateMouse);
            window.removeEventListener('resize', handleResize);
            engine.dispose();
        };
    }, []);

    return (
        <>
            {/* Loading 介面：確保 z-index 高於一切 */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-[#00d4ff]">
                    <div className="relative w-64 h-1 bg-gray-900">
                        <div 
                            className="absolute inset-0 bg-[#ff5e00] transition-all duration-300 shadow-[0_0_15px_#ff5e00]"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <span className="text-xs tracking-[0.3em] text-white animate-pulse">Establishing Neural Link</span>
                        <span className="text-[10px] opacity-50">{loadingProgress}% COMPLETE</span>
                    </div>
                </div>
            )}
            
            {/* 4. Canvas 佈局修正：使用 w-full h-full 撐開 */}
            <canvas 
                ref={canvasRef} 
                className="fixed inset-0 w-screen h-screen z-0 bg-black touch-none" 
                style={{ display: 'block' }}
            />
        </>
    );
}

// 輔助函數
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
    const totalFrames = 45;
    const posAnim = new BABYLON.Animation("camPos", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    posAnim.setKeys([{ frame: 0, value: camera.position.clone() }, { frame: totalFrames, value: newPos }]);
    const targetAnim = new BABYLON.Animation("camTarget", "target", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    targetAnim.setKeys([{ frame: 0, value: camera.getTarget().clone() }, { frame: totalFrames, value: newTarget }]);
    
    const easing = new BABYLON.QuarticEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    posAnim.setEasingFunction(easing);
    targetAnim.setEasingFunction(easing);
    
    scene.beginDirectAnimation(camera, [posAnim, targetAnim], 0, totalFrames, false, 1, onEnd);
}