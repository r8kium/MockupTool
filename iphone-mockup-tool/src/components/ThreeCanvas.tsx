import {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  forwardRef,
  Component,
  type ReactNode,
  type MutableRefObject,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { EditorState, SceneTemplate } from '@/types'
import type { ShadowPreset } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'

const BODY_MESHES = new Set([
  // iPhone / phone body
  'Edge', 'Edge_Antenna', 'Edge_Clean', 'Back', 'Matte', 'Gray',
  'Back_Glass', 'Glass_Back', 'Screen_Edge',
  // _001 / _002 suffix duplicates (iPhone 12 2020, iPhone 13)
  'Edge_001', 'Edge_Antenna_001', 'Back_001', 'Gray_001', 'Screen_Edge_001',
  'Matte_001', 'Matte_002',
  // Generic device body
  'Body', 'Keyboard', 'Trackpad', 'Base', 'Lid', 'Hinge',
  'Bottom', 'Top', 'Frame', 'Band', 'Case',
  // Mac _Top / _Bottom variants (MacBook Air M2, MacBook Pro M3)
  'Body_Top', 'Gray_Top', 'Light_Gray', 'Matte_Top',
  'Screen_Edge_Top', 'Screen_edge_Top', 'Screen_Edge_Island',
  'Bottom_Body', 'Bottom_TouchPad', 'Top_Body',
  // Mac keyboard / peripherals
  'Keys', 'Keys_Text', 'Key_Text', 'MousePad',
  'Power_key', 'PowerButton', 'FingerPrint', 'Port_Metal', 'USB',
  // iPhone 17 / iPad primitive body meshes
  'primitive_0', 'primitive_1', 'primitive_2',
  'primitive_3', 'primitive_4', 'primitive_5', 'primitive_6',
  // MacBook Pro M1 16" variants
  'Body_Bottom', 'FingerPrint_Edge', 'Plastic_Screen', 'Key_text',
  // MacBook Air M1 variants
  'Caps_Key', 'Bottom_Body_001', 'Screen_Bottom', 'Key', 'Metals',
  // iMac 24" variants
  'Body_Light_001', 'Body_Light_002', 'Body_Light_003',
  'Metal', 'Power', 'Screw', 'Plane_001', 'Plane', 'plane',
  // iPad + Magic Keyboard variants
  'Charger_icon', 'Small_Circle', 'LiDAR',
  // iPad misc (iPad Mini 6, generic/infinity tablet)
  'Charge_Window', 'Touch_ID', 'Small_Circles', 'Charge_Icon',
  // Apple Watch Ultra 2 variants
  'Antenna', 'Body_Polished', 'Body_Rough', 'Button_Glossy',
  'Loop', 'Loop_Shape', 'Cube',
  // Watch series 6/7 texture variants
  'Back_Tex', 'Sensor_Line',
  // Samsung Galaxy (numbered variants)
  'Matte_001',
  // Surface Laptop 4
  'Body_Darker', 'Device_001', 'Text', 'Body_001',
  // Typo in pro-max-notchless model ('Geay' = Gray)
  'Geay',
  // _clayable suffix (iPhone 13 mini)
  'Matte_clayable',
])

const SHADOW_CONFIGS: Record<ShadowPreset, { opacity: number; scale: number; blur: number; far: number } | null> = {
  none:  null,
  soft:  { opacity: 0.25, scale: 20, blur: 4,   far: 6  },
  long:  { opacity: 0.40, scale: 26, blur: 2.5,  far: 14 },
  short: { opacity: 0.55, scale: 12, blur: 1.5,  far: 4  },
}

const DEFAULT_CAM: Record<EditorState['cameraAngle'], [number, number, number]> = {
  front:     [0,  0, 18],
  isometric: [7,  4, 16],
  side:      [18, 2,  8],
}

// ── Error boundary ─────────────────────────────────────────────────────────────
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-6 bg-[#1e1e1e]">
          <p className="text-sm font-medium text-red-400">3D render error</p>
          <pre className="text-xs text-white/40 bg-white/5 rounded p-3 max-w-sm overflow-auto whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Device model ───────────────────────────────────────────────────────────────
interface DeviceModelProps {
  gltfPath: string
  colorHex: string
  screenshotUrl: string | null
  shadow: boolean
  modelScale: number
  onScreenClick?: () => void
}

function DeviceModel({ gltfPath, colorHex, screenshotUrl, shadow, modelScale, onScreenClick }: DeviceModelProps) {
  const { scene } = useGLTF(gltfPath)
  const cloned = useMemo(() => scene.clone(true), [scene])

  // Auto-center: compute model-space bounding box excluding shadow/tag meshes
  const centerOffset = useMemo(() => {
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity
    cloned.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const n = obj.name
      if (n.toLowerCase().includes('shadow') || n === 'rotatoTag') return
      const geo = obj.geometry as THREE.BufferGeometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const b = geo.boundingBox
      if (!b) return
      if (b.min.x < minX) minX = b.min.x; if (b.max.x > maxX) maxX = b.max.x
      if (b.min.y < minY) minY = b.min.y; if (b.max.y > maxY) maxY = b.max.y
      if (b.min.z < minZ) minZ = b.min.z; if (b.max.z > maxZ) maxZ = b.max.z
    })
    if (!isFinite(minX)) return new THREE.Vector3()
    return new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2)
  }, [cloned])

  const screenshotTex = useMemo(() => {
    if (!screenshotUrl) return null
    const tex = new THREE.TextureLoader().load(screenshotUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    return tex
  }, [screenshotUrl])

  useEffect(() => {
    const bodyColor = new THREE.Color(colorHex)
    cloned.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      const name: string = node.name

      if (name.toLowerCase().includes('shadow') || name === 'rotatoTag') {
        node.visible = false; return
      }
      if (name === 'Screen' || name === 'Screen_Top' || name === 'Screen_Inside') {
        if (screenshotTex) {
          const uvAttr = node.geometry.attributes.uv as THREE.BufferAttribute | undefined
          if (uvAttr) {
            let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
            for (let i = 0; i < uvAttr.count; i++) {
              const u = uvAttr.getX(i), v = uvAttr.getY(i)
              if (u < minU) minU = u; if (u > maxU) maxU = u
              if (v < minV) minV = v; if (v > maxV) maxV = v
            }
            const ru = maxU - minU || 1, rv = maxV - minV || 1
            screenshotTex.repeat.set(1 / ru, 1 / rv)
            screenshotTex.offset.set(-minU / ru, -minV / rv)
          }
        }
        node.material = new THREE.MeshBasicMaterial({
          map: screenshotTex ?? null,
          color: screenshotTex ? '#ffffff' : '#050505',
        })
        node.receiveShadow = false; return
      }
      if (
        name === 'Glass' || name === 'Glass_Screen' || name === 'Glass_screen' ||
        name === 'Glass_Top' || name === 'Glass_Screen_Top' || name === 'Glass_001'
      ) {
        if (screenshotTex) { node.visible = false } else {
          node.visible = true
          node.material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff', transmission: 0.55, roughness: 0.02,
            metalness: 0, thickness: 0.3, transparent: true, opacity: 0.35, depthWrite: false,
          })
          node.renderOrder = 2
        }
        return
      }
      if (name.includes('Glass_Lens') || name.includes('Glass_Camera') || name === 'Glass_Back') {
        node.material = new THREE.MeshPhysicalMaterial({ color: '#0a0a0a', roughness: 0.05, metalness: 0.1, transmission: 0.2 }); return
      }
      // Dynamic Island and related elements (iPhone 16/17)
      if (
        name === 'Dynamic_Island' || name === 'Island' ||
        name === 'Glass_Island' || name === 'Gray_Island' ||
        name === 'Lens_Island' || name === 'Sensor_Island' || name === 'Sensor_island'
      ) {
        node.material = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.2, metalness: 0.5 }); return
      }
      // Rougher glass variants (Galaxy S25, iPhone 16, iPhone 12 2020 _001)
      if (name === 'GlassRough' || name === 'Glass_Rough' || name === 'Glass_Rough_001') {
        node.material = new THREE.MeshPhysicalMaterial({
          color: '#ffffff', transmission: 0.4, roughness: 0.15,
          metalness: 0, thickness: 0.3, transparent: true, opacity: 0.4, depthWrite: false,
        })
        node.visible = !screenshotTex
        node.renderOrder = 2; return
      }
      // Black ring / bezel elements (Galaxy S25)
      if (name === 'BlackRing' || name === 'Front_Gray') {
        node.material = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.4, metalness: 0.6 }); return
      }
      if (name.includes('Lens') || name === 'Lidar' || name === 'Camera_Module' || name === 'Camera_Edge' || name === 'Front_Lens') {
        node.material = new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.2, metalness: 0.9 }); return
      }
      if (name === 'Flash' || name === 'Flash_001' || name === 'Flash_clayable') {
        node.material = new THREE.MeshStandardMaterial({ color: '#fff5cc', roughness: 0.1, metalness: 0.5 }); return
      }
      if (
        name === 'Black' || name === 'Black_001' || name === 'Black_clayable' ||
        name === 'Sensor' || name === 'Sensor_2' ||
        name === 'Mic' || name === 'Mic_001' ||
        name === 'Plastic' || name === 'Plastic_001' || name === 'Plastic_clayable' ||
        name === 'Plastic_Top' || name === 'Bottom_Plastic' ||
        name === 'Hinge_BlackBox' || name === 'Screen_Edge_Black'
      ) {
        node.material = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.5, metalness: 0.4 }); return
      }
      // Watch Ultra orange action button
      if (name === 'Body_Orange') {
        node.material = new THREE.MeshStandardMaterial({ color: '#e06020', roughness: 0.3, metalness: 0.3 }); return
      }
      if (BODY_MESHES.has(name)) {
        node.material = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.22, metalness: 0.88 })
        node.castShadow = shadow; return
      }
      node.material = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.6 })
      node.castShadow = shadow
    })
  }, [cloned, colorHex, screenshotTex, shadow])

  return (
    <group
      scale={modelScale}
      position={[-centerOffset.x, -centerOffset.y, -centerOffset.z]}
    >
      <primitive
        object={cloned}
        onClick={(e: any) => {
          if (!onScreenClick) return
          const n: string = e.object?.name ?? ''
          if (n === 'Screen' || n === 'Screen_Top' || n === 'Screen_Inside') {
            e.stopPropagation()
            onScreenClick()
          }
        }}
      />
    </group>
  )
}

// ── Studio lighting ────────────────────────────────────────────────────────────
function StudioLighting({ shadow }: { shadow: boolean }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 10, 8]} intensity={1.8} castShadow={shadow}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.1} shadow-camera-far={120}
        shadow-camera-left={-22} shadow-camera-right={22}
        shadow-camera-top={22} shadow-camera-bottom={-22}
      />
      <directionalLight position={[-6, 5, 4]} intensity={0.5} />
      <directionalLight position={[0, 8, -10]} intensity={0.4} />
      <hemisphereLight args={['#e8eaf6', '#37474f', 0.35]} />
    </>
  )
}

// ── Scene background ───────────────────────────────────────────────────────────
function SceneBg({ background }: { background: EditorState['background'] }) {
  const { scene } = useThree()
  useEffect(() => {
    scene.background =
      background.type === 'solid' && background.solidColor
        ? new THREE.Color(background.solidColor) : null
    return () => { scene.background = null }
  }, [scene, background])
  return null
}

// ── Camera controller (preset + orbit, kept in sync) ──────────────────────────
function CameraController({
  angle,
  presets,
}: {
  angle: EditorState['cameraAngle']
  presets: Record<EditorState['cameraAngle'], [number, number, number]>
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    const pos = presets[angle]
    camera.position.set(...pos)
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [angle, presets, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={3}
      maxDistance={60}
    />
  )
}

// ── Export helper ──────────────────────────────────────────────────────────────
function Exporter({ onReady }: { onReady: (fn: () => string) => void }) {
  const { gl } = useThree()
  useEffect(() => { onReady(() => gl.domElement.toDataURL('image/png')) }, [gl, onReady])
  return null
}

// ── Public API ─────────────────────────────────────────────────────────────────
export interface ThreeCanvasRef { exportPNG: () => string }

interface ThreeCanvasProps {
  state: EditorState & { shadowPreset?: ShadowPreset }
  canvasRef?: MutableRefObject<ThreeCanvasRef | null>
  onScreenshotUpload?: (dataUrl: string) => void
  /** Multi-device scene template (overrides state.deviceId when set) */
  sceneTemplate?: SceneTemplate
  /** Screenshots keyed by slot index for multi-device scenes */
  slotScreenshots?: Record<number, string | null>
  onSlotScreenshotUpload?: (slotIndex: number, dataUrl: string) => void
}

export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
  function ThreeCanvas({ state, canvasRef, onScreenshotUpload, sceneTemplate, slotScreenshots, onSlotScreenshotUpload }, _ref) {
    const exportFnRef = useRef<(() => string) | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const slotInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

    const device = DEVICE_MODELS[state.deviceId]
    const color = device.colors.find((c) => c.id === state.colorId) ?? device.colors[0]
    const shadowPreset = (state.shadowPreset ?? 'long') as ShadowPreset
    const shadowCfg = SHADOW_CONFIGS[shadowPreset]
    const camPresets = sceneTemplate?.camPresets ?? device.camPresets ?? DEFAULT_CAM

    useEffect(() => {
      if (canvasRef) canvasRef.current = { exportPNG: () => exportFnRef.current?.() ?? '' }
    }, [canvasRef])

    const handleScreenClick = useCallback(() => { fileInputRef.current?.click() }, [])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !onScreenshotUpload) return
      const reader = new FileReader()
      reader.onload = (ev) => onScreenshotUpload(ev.target?.result as string)
      reader.readAsDataURL(file)
      e.target.value = ''
    }, [onScreenshotUpload])

    const handleSlotFileChange = useCallback((slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !onSlotScreenshotUpload) return
      const reader = new FileReader()
      reader.onload = (ev) => onSlotScreenshotUpload(slotIndex, ev.target?.result as string)
      reader.readAsDataURL(file)
      e.target.value = ''
    }, [onSlotScreenshotUpload])

    const bgStyle: React.CSSProperties =
      state.background.type === 'gradient'
        ? { background: `linear-gradient(${state.background.gradientAngle ?? 135}deg, ${state.background.gradientFrom ?? '#667eea'}, ${state.background.gradientTo ?? '#764ba2'})` }
        : state.background.type === 'image' && state.background.imageDataUrl
          ? { backgroundImage: `url(${state.background.imageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}

    return (
      <CanvasErrorBoundary>
        <div className="relative w-full h-full" style={bgStyle}>
          {/* Single-device file input */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {/* Per-slot file inputs for multi-device scenes */}
          {sceneTemplate?.slots.map((_, i) => (
            <input
              key={i}
              ref={(el) => { slotInputRefs.current[i] = el }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSlotFileChange(i, e)}
            />
          ))}
          <Canvas
            camera={{ position: camPresets[state.cameraAngle], fov: 45 }}
            shadows={!!shadowCfg}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
            style={{ background: 'transparent' }}
          >
            <SceneBg background={state.background} />
            <CameraController angle={state.cameraAngle} presets={camPresets} />
            <Exporter onReady={(fn) => { exportFnRef.current = fn }} />
            <StudioLighting shadow={!!shadowCfg} />

            <Suspense fallback={null}>
              {sceneTemplate ? (
                // Multi-device scene
                sceneTemplate.slots.map((slot, i) => {
                  const slotDevice = DEVICE_MODELS[slot.deviceId]
                  const slotScale = slotDevice.modelScale * (slot.scaleMul ?? 1)
                  const rot = slot.rotation.map((d) => (d * Math.PI) / 180) as [number, number, number]
                  return (
                    <group key={i} position={slot.position} rotation={rot}>
                      <DeviceModel
                        gltfPath={slotDevice.gltfPath}
                        colorHex={slotDevice.colors[0].hex}
                        screenshotUrl={slotScreenshots?.[i] ?? null}
                        shadow={!!shadowCfg}
                        modelScale={slotScale}
                        onScreenClick={onSlotScreenshotUpload ? () => slotInputRefs.current[i]?.click() : undefined}
                      />
                    </group>
                  )
                })
              ) : (
                // Single device
                <DeviceModel
                  gltfPath={device.gltfPath}
                  colorHex={color.hex}
                  screenshotUrl={state.screenshot}
                  shadow={!!shadowCfg}
                  modelScale={device.modelScale}
                  onScreenClick={onScreenshotUpload ? handleScreenClick : undefined}
                />
              )}
            </Suspense>

            {shadowCfg && (
              <ContactShadows
                position={[0, -7, 0]}
                opacity={shadowCfg.opacity}
                scale={shadowCfg.scale}
                blur={shadowCfg.blur}
                far={shadowCfg.far}
              />
            )}

          </Canvas>
        </div>
      </CanvasErrorBoundary>
    )
  }
)
