import {
  useRef,
  useEffect,
  useMemo,
  Suspense,
  forwardRef,
  Component,
  type ReactNode,
  type MutableRefObject,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { EditorState } from '@/types'
import type { ShadowPreset } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'

const BODY_MESHES = new Set([
  'Edge', 'Edge_Antenna', 'Edge_Clean', 'Back', 'Matte', 'Gray',
  'Back_Glass', 'Glass_Back', 'Screen_Edge',
  'Body', 'Keyboard', 'Trackpad', 'Base', 'Lid', 'Hinge',
  'Bottom', 'Top', 'Frame', 'Band', 'Case',
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
}

function DeviceModel({ gltfPath, colorHex, screenshotUrl, shadow, modelScale }: DeviceModelProps) {
  const { scene } = useGLTF(gltfPath)
  const cloned = useMemo(() => scene.clone(true), [scene])

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
      if (name === 'Screen') {
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
      if (name === 'Glass' || name === 'Glass_Screen') {
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
      if (name.includes('Lens') || name === 'Camera_Module' || name === 'Camera_Edge') {
        node.material = new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.2, metalness: 0.9 }); return
      }
      if (name === 'Flash') {
        node.material = new THREE.MeshStandardMaterial({ color: '#fff5cc', roughness: 0.1, metalness: 0.5 }); return
      }
      if (name === 'Black' || name === 'Sensor' || name === 'Mic' || name === 'Plastic') {
        node.material = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.5, metalness: 0.4 }); return
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
    <group scale={modelScale}>
      <primitive object={cloned} />
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

// ── Camera preset ──────────────────────────────────────────────────────────────
function CameraPreset({
  angle,
  presets,
}: {
  angle: EditorState['cameraAngle']
  presets: Record<EditorState['cameraAngle'], [number, number, number]>
}) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(...presets[angle])
    camera.lookAt(0, 0, 0)
  }, [angle, presets, camera])
  return null
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
}

export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
  function ThreeCanvas({ state, canvasRef }, _ref) {
    const exportFnRef = useRef<(() => string) | null>(null)
    const device = DEVICE_MODELS[state.deviceId]
    const color = device.colors.find((c) => c.id === state.colorId) ?? device.colors[0]
    const shadowPreset = (state.shadowPreset ?? 'long') as ShadowPreset
    const shadowCfg = SHADOW_CONFIGS[shadowPreset]
    const camPresets = device.camPresets ?? DEFAULT_CAM

    useEffect(() => {
      if (canvasRef) canvasRef.current = { exportPNG: () => exportFnRef.current?.() ?? '' }
    }, [canvasRef])

    const bgStyle: React.CSSProperties =
      state.background.type === 'gradient'
        ? { background: `linear-gradient(${state.background.gradientAngle ?? 135}deg, ${state.background.gradientFrom ?? '#667eea'}, ${state.background.gradientTo ?? '#764ba2'})` }
        : state.background.type === 'image' && state.background.imageDataUrl
          ? { backgroundImage: `url(${state.background.imageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}

    return (
      <CanvasErrorBoundary>
        <div className="relative w-full h-full" style={bgStyle}>
          <Canvas
            camera={{ position: camPresets[state.cameraAngle], fov: 45 }}
            shadows={!!shadowCfg}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
            style={{ background: 'transparent' }}
          >
            <SceneBg background={state.background} />
            <CameraPreset angle={state.cameraAngle} presets={camPresets} />
            <Exporter onReady={(fn) => { exportFnRef.current = fn }} />
            <StudioLighting shadow={!!shadowCfg} />

            <Suspense fallback={null}>
              <DeviceModel
                gltfPath={device.gltfPath}
                colorHex={color.hex}
                screenshotUrl={state.screenshot}
                shadow={!!shadowCfg}
                modelScale={device.modelScale}
              />
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

            <OrbitControls enablePan={false} minDistance={3} maxDistance={60} />
          </Canvas>
        </div>
      </CanvasErrorBoundary>
    )
  }
)
