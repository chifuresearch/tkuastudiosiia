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

    void main(void) {
        vec4 viewPos = view * vec4(position, 1.0);
        float distToCamera = -viewPos.z;

        // --- 1. Matrix 網格化 (Grid Logic) ---
        float gridSize = 0.05; // 數值越小，解析度越高
        vec3 snappedPos = floor(position / gridSize) * gridSize;

        // --- 2. 垂直流動數據線 (Data Rain) ---
        // 根據 XZ 座標產生每條「代碼線」的隨機速度與偏移
        float columnId = random(snappedPos.xz);
        float speed = 0.15 + columnId * 0.5;
        float flow = mod(snappedPos.y * 0.2 - time * speed, 0.3);
        
        // 只有在特定的「流動區塊」才發光
        float brightness = pow(1.0 - flow, 8.0); 
        
        // --- 3. 互動擾動 (High-Res Glitch) ---
        vec4 screenPos = worldViewProjection * vec4(position, 1.0);
        vec2 normalizedScreenPos = (screenPos.xy / screenPos.w) * 0.5 + 0.5;
        float interaction = 1.0 - smoothstep(0.0, 0.1, distance(normalizedScreenPos, mousePos));
        
        // 互動時產生的水平數據抖動
        float glitch = step(0.98, random(vec2(time * 10.0, snappedPos.y))) * interaction;
        vec3 finalPos = snappedPos + vec3(glitch * 0.5, 0.0, 0.0);

        gl_Position = worldViewProjection * vec4(finalPos, 1.0);

        // --- 4. 點的大小與顏色 ---
        float baseSize = perspectiveFactor / gl_Position.w;
        gl_PointSize = baseSize * (0.5 + brightness * 2.0 + interaction * 3.0);
        gl_PointSize = clamp(gl_PointSize, 0.3, 3.0);

        // Matrix 經典配色：深綠、螢光綠、近乎白色的核心
        vec3 matrixDark = vec3(0.0, 0.2, 0.0);
        vec3 matrixBright = vec3(0.0, 1.0, 0.3);
        vec3 matrixCore = vec3(1.0, 0.6, 0.0);

        // vec3 cTeal = vec3(0.0, 0.9, 0.95);    // 圖片中的亮青色
        // vec3 cCrimson = vec3(0.7, 0.0, 0.15); // 圖片中的深紅
        // vec3 cWhite = vec3(1.0, 1.0, 1.0);    // 亮部白點

        // vec3 matrixDark = vec3(0.0, 0.2, 0.0);
        // vec3 matrixBright = vec3(0.0, 1.0, 0.3);
        // vec3 matrixCore = vec3(0.8, 1.0, 0.8);

        vColor = mix(matrixDark, matrixBright, brightness);
        vColor = mix(vColor, matrixCore, pow(brightness, 2.0) + interaction);

        // 越遠越暗，且只有在數據流動時才明顯可見
        vAlpha = (0.1 + brightness * 0.9) * (1.0 - smoothstep(15.0, 40.0, distToCamera));
    }
`;

const pointCloudFragmentShader = `
    precision highp float;
    varying float vAlpha;
    varying vec3 vColor;
    void main(void) {
        // 建立正方形邊界
        vec2 uv = gl_PointCoord - vec2(0.5);
        float maxDist = max(abs(uv.x), abs(uv.y));
        
        if (maxDist > 0.5) discard;

        // 加入掃描線效果 (Scanline)
        float scanline = step(0.2, mod(gl_PointCoord.y * 10.0, 1.0));
        
        // 強化邊緣感
        float edge = smoothstep(0.5, 0.48, maxDist);
        
        gl_FragColor = vec4(vColor * (scanline * 0.5 + 0.5), vAlpha * edge);
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
        pipeline.bloomThreshold = 0.2;
        pipeline.bloomWeight = 0.5;
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