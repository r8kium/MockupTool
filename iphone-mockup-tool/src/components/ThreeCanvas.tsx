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
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { AnimTemplate, EditorState, SceneTemplate } from '@/types'
import type { ShadowPreset } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import { readFileAsDataUrl, evalBezier } from '@/lib/utils'
import { animClock } from '@/lib/animClock'
import { getPresetCss } from '@/lib/backgrounds'
import { AnimatedBackground } from '@/components/AnimatedBackground'

// ── Material constants (module-level, shared across all device instances) ───────
const M = {
  island:    new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.2,  metalness: 0.5 }),
  bezel:     new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.4,  metalness: 0.6 }),
  lens:      new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.2,  metalness: 0.9 }),
  flash:     new THREE.MeshStandardMaterial({ color: '#fff5cc', roughness: 0.1,  metalness: 0.5 }),
  dark:      new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.5,  metalness: 0.4 }),
  orange:    new THREE.MeshStandardMaterial({ color: '#e06020', roughness: 0.3,  metalness: 0.3 }),
  glassLens: new THREE.MeshPhysicalMaterial({ color: '#0a0a0a', roughness: 0.05, metalness: 0.1, transmission: 0.2 }),
} as const

const GLASS_FRONT  = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.55, roughness: 0.02, metalness: 0, thickness: 0.3, transparent: true, opacity: 0.35, depthWrite: false })
const GLASS_ROUGH  = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.40, roughness: 0.15, metalness: 0, thickness: 0.3, transparent: true, opacity: 0.40, depthWrite: false })

// ── Mesh name sets ───────────────────────────────────────────────────────────────
const SCREEN_MESHES      = new Set(['Screen', 'Screen_Top', 'Screen_Inside'])
const FRONT_GLASS_MESHES = new Set(['Glass', 'Glass_Screen', 'Glass_screen', 'Glass_Top', 'Glass_Screen_Top', 'Glass_001'])
const ROUGH_GLASS_MESHES = new Set(['GlassRough', 'Glass_Rough', 'Glass_Rough_001'])
const ISLAND_MESHES      = new Set(['Dynamic_Island', 'Island', 'Glass_Island', 'Gray_Island', 'Lens_Island', 'Sensor_Island', 'Sensor_island'])
const BEZEL_MESHES       = new Set(['BlackRing', 'Front_Gray'])
const FLASH_MESHES       = new Set(['Flash', 'Flash_001', 'Flash_clayable'])
const DARK_MESHES        = new Set(['Black', 'Black_001', 'Black_clayable', 'Sensor', 'Sensor_2', 'Mic', 'Mic_001', 'Plastic', 'Plastic_001', 'Plastic_clayable', 'Plastic_Top', 'Bottom_Plastic', 'Hinge_BlackBox', 'Screen_Edge_Black'])

const BODY_MESHES = new Set([
  'Edge', 'Edge_Antenna', 'Edge_Clean', 'Back', 'Matte', 'Gray',
  'Back_Glass', 'Glass_Back', 'Screen_Edge',
  'Edge_001', 'Edge_Antenna_001', 'Back_001', 'Gray_001', 'Screen_Edge_001', 'Matte_001', 'Matte_002',
  'Body', 'Keyboard', 'Trackpad', 'Base', 'Lid', 'Hinge', 'Bottom', 'Top', 'Frame', 'Band', 'Case',
  'Body_Top', 'Gray_Top', 'Light_Gray', 'Matte_Top',
  'Screen_Edge_Top', 'Screen_edge_Top', 'Screen_Edge_Island',
  'Bottom_Body', 'Bottom_TouchPad', 'Top_Body',
  'Keys', 'Keys_Text', 'Key_Text', 'MousePad', 'Power_key', 'PowerButton', 'FingerPrint', 'Port_Metal', 'USB',
  'primitive_0', 'primitive_1', 'primitive_2', 'primitive_3', 'primitive_4', 'primitive_5', 'primitive_6',
  'Body_Bottom', 'FingerPrint_Edge', 'Plastic_Screen', 'Key_text',
  'Caps_Key', 'Bottom_Body_001', 'Screen_Bottom', 'Key', 'Metals',
  'Body_Light_001', 'Body_Light_002', 'Body_Light_003',
  'Metal', 'Power', 'Screw', 'Plane_001', 'Plane', 'plane',
  'Charger_icon', 'Small_Circle', 'LiDAR',
  'Charge_Window', 'Touch_ID', 'Small_Circles', 'Charge_Icon',
  'Antenna', 'Body_Polished', 'Body_Rough', 'Button_Glossy', 'Loop', 'Loop_Shape', 'Cube',
  'Back_Tex', 'Sensor_Line',
  'Body_Darker', 'Device_001', 'Text', 'Body_001',
  'Geay', 'Matte_clayable',
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

// ── Helpers ──────────────────────────────────────────────────────────────────────
function normalizeScreenUV(node: THREE.Mesh, tex: THREE.Texture) {
  const uv = node.geometry.attributes.uv as THREE.BufferAttribute | undefined
  if (!uv) return
  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i), v = uv.getY(i)
    if (u < minU) minU = u; if (u > maxU) maxU = u
    if (v < minV) minV = v; if (v > maxV) maxV = v
  }
  const ru = maxU - minU || 1, rv = maxV - minV || 1
  tex.repeat.set(1 / ru, 1 / rv)
  tex.offset.set(-minU / ru, -minV / rv)
}

function computeCenter(root: THREE.Object3D): THREE.Vector3 {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  root.traverse((obj) => {
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
  return isFinite(minX)
    ? new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2)
    : new THREE.Vector3()
}

// ── Error boundary ────────────────────────────────────────────────────────────────
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 bg-[#1e1e1e]">
        <p className="text-sm font-medium text-red-400">3D render error</p>
        <pre className="text-xs text-white/40 bg-white/5 rounded p-3 max-w-sm overflow-auto whitespace-pre-wrap">
          {this.state.error.message}
        </pre>
      </div>
    )
    return this.props.children
  }
}

// ── Device model ──────────────────────────────────────────────────────────────────
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
  const cloned  = useMemo(() => scene.clone(true), [scene])
  const center  = useMemo(() => computeCenter(cloned), [cloned])

  const screenshotTex = useMemo(() => {
    if (!screenshotUrl) return null
    const tex = new THREE.TextureLoader().load(screenshotUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    return tex
  }, [screenshotUrl])

  useEffect(() => {
    const bodyMat     = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: 0.22, metalness: 0.88 })
    const fallbackMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: 0.30, metalness: 0.60 })

    cloned.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      const n = node.name

      if (n.toLowerCase().includes('shadow') || n === 'rotatoTag') { node.visible = false; return }

      if (SCREEN_MESHES.has(n)) {
        if (screenshotTex) normalizeScreenUV(node, screenshotTex)
        node.material = new THREE.MeshBasicMaterial({
          map: screenshotTex ?? null,
          color: screenshotTex ? '#ffffff' : '#050505',
          polygonOffset: true,
          polygonOffsetFactor: 4,
          polygonOffsetUnits: 4,
        })
        node.receiveShadow = false
        return
      }

      if (FRONT_GLASS_MESHES.has(n)) {
        node.visible = !screenshotTex
        if (!screenshotTex) { node.material = GLASS_FRONT; node.renderOrder = 2 }
        return
      }

      if (ROUGH_GLASS_MESHES.has(n)) {
        node.visible = !screenshotTex
        if (!screenshotTex) { node.material = GLASS_ROUGH; node.renderOrder = 2 }
        return
      }

      if (n.includes('Glass_Lens') || n.includes('Glass_Camera') || n === 'Glass_Back') { node.material = M.glassLens; return }
      if (ISLAND_MESHES.has(n))  { node.material = M.island;  return }
      if (BEZEL_MESHES.has(n))   { node.material = M.bezel;   return }
      if (n.includes('Lens') || n === 'Lidar' || n === 'Camera_Module' || n === 'Camera_Edge' || n === 'Front_Lens') { node.material = M.lens; return }
      if (FLASH_MESHES.has(n))   { node.material = M.flash;   return }
      if (DARK_MESHES.has(n))    { node.material = M.dark;    return }
      if (n === 'Body_Orange')   { node.material = M.orange;  return }

      node.material = BODY_MESHES.has(n) ? bodyMat : fallbackMat
      node.castShadow = shadow
    })
  }, [cloned, colorHex, screenshotTex, shadow])

  return (
    <group scale={modelScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive
          object={cloned}
          onClick={(e: any) => {
            if (!onScreenClick || !SCREEN_MESHES.has(e.object?.name ?? '')) return
            e.stopPropagation()
            onScreenClick()
          }}
        />
      </group>
    </group>
  )
}

// ── Studio lighting ───────────────────────────────────────────────────────────────
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

// ── Scene background ──────────────────────────────────────────────────────────────
function SceneBg({ background }: { background: EditorState['background'] }) {
  const { scene } = useThree()
  useEffect(() => {
    scene.background = background.type === 'solid' && background.solidColor
      ? new THREE.Color(background.solidColor) : null
    return () => { scene.background = null }
  }, [scene, background])
  return null
}

// ── Animated camera ───────────────────────────────────────────────────────────────
function AnimatedCamera({ template }: { template: AnimTemplate }) {
  const { camera } = useThree()
  const elapsedRef = useRef(0)
  const totalDuration = useMemo(
    () => template.keyframes.reduce((s, kf) => s + kf.duration, 0),
    [template]
  )

  useEffect(() => {
    elapsedRef.current = 0
    animClock.templateId = template.id
  }, [template])

  useFrame((_, delta) => {
    if (animClock.seekTo !== null) {
      elapsedRef.current = animClock.seekTo
      animClock.seekTo = null
    }
    if (!animClock.paused) elapsedRef.current += delta
    elapsedRef.current = elapsedRef.current % totalDuration
    animClock.elapsed = elapsedRef.current
    const t = elapsedRef.current
    const kfs = template.keyframes
    const n = kfs.length
    let segStart = 0
    for (let i = 0; i < n; i++) {
      const segEnd = segStart + kfs[i].duration
      if (t <= segEnd || i === n - 1) {
        const progress = kfs[i].duration > 0 ? Math.min((t - segStart) / kfs[i].duration, 1) : 1
        const [c1x, c1y, c2x, c2y] = kfs[i].easing
        const ep = evalBezier(c1x, c1y, c2x, c2y, progress)
        const next = kfs[(i + 1) % n]
        const cx = kfs[i].cam[0] + (next.cam[0] - kfs[i].cam[0]) * ep
        const cy = kfs[i].cam[1] + (next.cam[1] - kfs[i].cam[1]) * ep
        const cz = kfs[i].cam[2] + (next.cam[2] - kfs[i].cam[2]) * ep
        const roll = kfs[i].roll + (next.roll - kfs[i].roll) * ep
        camera.position.set(cx, cy, cz)
        camera.lookAt(0, 0, 0)
        camera.rotateZ((roll * Math.PI) / 180)
        break
      }
      segStart = segEnd
    }
  })

  return null
}

// ── Camera controller ────────────────────────────────────────────────────────────
function CameraController({ angle, presets, onMount }: {
  angle: EditorState['cameraAngle']
  presets: Record<EditorState['cameraAngle'], [number, number, number]>
  onMount?: () => void
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => { onMount?.() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    camera.position.set(...presets[angle])
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update()
  }, [angle, presets, camera])

  return <OrbitControls ref={controlsRef} enablePan={false} minDistance={3} maxDistance={60} />
}

// ── Export helper ─────────────────────────────────────────────────────────────────
interface ThreeCtx { gl: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera }

function Exporter({ onReady }: { onReady: (exportFn: () => string, ctx: ThreeCtx) => void }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    onReady(
      () => gl.domElement.toDataURL('image/png'),
      { gl: gl as THREE.WebGLRenderer, scene: scene as THREE.Scene, camera: camera as THREE.Camera },
    )
  }, [gl, scene, camera, onReady])
  return null
}

// ── Public API ────────────────────────────────────────────────────────────────────
export interface ThreeCanvasRef {
  exportPNG: () => string
  getThreeContext: () => ThreeCtx | null
}

interface ThreeCanvasProps {
  state: EditorState & { shadowPreset?: ShadowPreset }
  canvasRef?: MutableRefObject<ThreeCanvasRef | null>
  onScreenshotUpload?: (dataUrl: string) => void
  sceneTemplate?: SceneTemplate
  slotScreenshots?: Record<number, string | null>
  onSlotScreenshotUpload?: (slotIndex: number, dataUrl: string) => void
  animTemplate?: AnimTemplate | null
}

export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
  function ThreeCanvas({ state, canvasRef, onScreenshotUpload, sceneTemplate, slotScreenshots, onSlotScreenshotUpload, animTemplate }, _ref) {
    const exportFnRef   = useRef<(() => string) | null>(null)
    const threeCtxRef   = useRef<ThreeCtx | null>(null)
    const fileInputRef  = useRef<HTMLInputElement>(null)
    const slotRefs      = useRef<Record<number, HTMLInputElement | null>>({})

    const device      = DEVICE_MODELS[state.deviceId]
    const colorHex    = state.colorId === 'custom' && state.customColorHex
      ? state.customColorHex
      : (device.colors.find((c) => c.id === state.colorId) ?? device.colors[0]).hex
    const shadowCfg   = SHADOW_CONFIGS[(state.shadowPreset ?? 'long') as ShadowPreset]
    const camPresets  = sceneTemplate?.camPresets ?? device.camPresets ?? DEFAULT_CAM

    useEffect(() => {
      if (canvasRef) canvasRef.current = {
        exportPNG: () => exportFnRef.current?.() ?? '',
        getThreeContext: () => threeCtxRef.current,
      }
    }, [canvasRef])

    const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => {
      const file = e.target.files?.[0]
      if (file) cb(await readFileAsDataUrl(file))
      e.target.value = ''
    }, [])

    const bgStyle: React.CSSProperties =
      state.background.type === 'gradient'
        ? { background: `linear-gradient(${state.background.gradientAngle ?? 135}deg, ${state.background.gradientFrom ?? '#667eea'}, ${state.background.gradientTo ?? '#764ba2'})` }
        : state.background.type === 'image' && state.background.imageDataUrl
          ? { backgroundImage: `url(${state.background.imageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : state.background.type === 'preset' && state.background.presetId
            ? { background: getPresetCss(state.background.presetId) }
            : {}

    return (
      <CanvasErrorBoundary>
        <div className="relative w-full h-full" style={bgStyle}>
          {state.background.type === 'animated' && state.background.animBgId && (
            <AnimatedBackground id={state.background.animBgId} />
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => onScreenshotUpload && onFileChange(e, onScreenshotUpload)} />
          {sceneTemplate?.slots.map((_, i) => (
            <input key={i} ref={(el) => { slotRefs.current[i] = el }} type="file" accept="image/*" className="hidden"
              onChange={(e) => onSlotScreenshotUpload && onFileChange(e, (url) => onSlotScreenshotUpload(i, url))} />
          ))}

          <Canvas
            camera={{ position: camPresets[state.cameraAngle], fov: 45 }}
            shadows={!!shadowCfg}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
            style={{ background: 'transparent' }}
          >
            <SceneBg background={state.background} />
            {animTemplate
              ? <AnimatedCamera template={animTemplate} />
              : <CameraController angle={state.cameraAngle} presets={camPresets} onMount={() => { animClock.templateId = null }} />
            }
            <Exporter onReady={(fn, ctx) => { exportFnRef.current = fn; threeCtxRef.current = ctx }} />
            <StudioLighting shadow={!!shadowCfg} />

            <Suspense fallback={null}>
              {sceneTemplate ? (
                sceneTemplate.slots.map((slot, i) => {
                  const dev = DEVICE_MODELS[slot.deviceId]
                  const rot = slot.rotation.map((d) => (d * Math.PI) / 180) as [number, number, number]
                  return (
                    <group key={i} position={slot.position} rotation={rot}>
                      <DeviceModel
                        gltfPath={dev.gltfPath}
                        colorHex={dev.colors[0].hex}
                        screenshotUrl={slotScreenshots?.[i] ?? null}
                        shadow={!!shadowCfg}
                        modelScale={dev.modelScale * (slot.scaleMul ?? 1)}
                        onScreenClick={onSlotScreenshotUpload ? () => slotRefs.current[i]?.click() : undefined}
                      />
                    </group>
                  )
                })
              ) : (
                <DeviceModel
                  gltfPath={device.gltfPath}
                  colorHex={colorHex}
                  screenshotUrl={state.screenshot}
                  shadow={!!shadowCfg}
                  modelScale={device.modelScale}
                  onScreenClick={onScreenshotUpload ? () => fileInputRef.current?.click() : undefined}
                />
              )}
            </Suspense>

            {shadowCfg && (
              <ContactShadows position={[0, -7, 0]}
                opacity={shadowCfg.opacity} scale={shadowCfg.scale}
                blur={shadowCfg.blur} far={shadowCfg.far} />
            )}
          </Canvas>
        </div>
      </CanvasErrorBoundary>
    )
  }
)
