import { useRef, useEffect, useMemo, Suspense, forwardRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { EditorState } from '@/types'
import { DEVICE_MODELS } from '@/lib/frames'

// ── Meshes that make up the structural/colored body of the phone ─────────────
const BODY_MESH_NAMES = new Set([
  'Edge', 'Edge_Antenna', 'Edge_Clean', 'Back', 'Matte', 'Gray',
  'Back_Glass', 'Glass_Back',
])

// ── Screen placeholder color while screenshot is loading ─────────────────────
const SCREEN_PLACEHOLDER = new THREE.Color(0x000000)

interface PhoneModelProps {
  gltfPath: string
  colorHex: string
  screenshotUrl: string | null
  shadow: boolean
}

function PhoneModel({ gltfPath, colorHex, screenshotUrl, shadow }: PhoneModelProps) {
  const { scene } = useGLTF(gltfPath)
  const cloned = useMemo(() => scene.clone(true), [scene])

  const screenshotTex = useMemo(() => {
    if (!screenshotUrl) return null
    const img = new Image()
    img.src = screenshotUrl
    const tex = new THREE.Texture(img)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    img.onload = () => { tex.needsUpdate = true }
    return tex
  }, [screenshotUrl])

  useEffect(() => {
    const bodyColor = new THREE.Color(colorHex)

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const name = child.name

      if (name === 'Screen') {
        const mat = new THREE.MeshStandardMaterial({
          map: screenshotTex,
          color: screenshotTex ? 0xffffff : SCREEN_PLACEHOLDER,
          roughness: 0.05,
          metalness: 0.0,
          envMapIntensity: 0.3,
        })
        child.material = mat
        child.receiveShadow = shadow
        return
      }

      if (name === 'Glass' || name === 'Glass_Screen') {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.85,
          roughness: 0.05,
          metalness: 0.0,
          thickness: 0.5,
          envMapIntensity: 1.5,
          transparent: true,
          opacity: 0.6,
        })
        child.renderOrder = 1
        return
      }

      if (name.includes('Glass_Lens') || name.includes('Glass_Camera')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x111111,
          transmission: 0.3,
          roughness: 0.1,
          metalness: 0.5,
          envMapIntensity: 2,
        })
        return
      }

      if (name.includes('Lens') || name === 'Camera_Module' || name === 'Camera_Edge') {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.3,
          metalness: 0.9,
          envMapIntensity: 1,
        })
        return
      }

      if (name === 'Flash') {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xfff8dc,
          roughness: 0.1,
          metalness: 0.6,
        })
        return
      }

      if (name === 'Black' || name === 'Sensor') {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.4,
          metalness: 0.5,
        })
        return
      }

      // Shadow mesh — invisible in 3D view
      if (name.includes('shadow') || name.includes('Shadow') || name === 'rotatoTag') {
        child.visible = false
        return
      }

      if (BODY_MESH_NAMES.has(name)) {
        child.material = new THREE.MeshStandardMaterial({
          color: bodyColor,
          roughness: 0.25,
          metalness: 0.85,
          envMapIntensity: 1.2,
        })
        child.castShadow = shadow
        return
      }

      // Fallback for any unnamed mesh
      child.material = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.3,
        metalness: 0.7,
      })
      child.castShadow = shadow
    })
  }, [cloned, colorHex, screenshotTex, shadow])

  return <primitive object={cloned} />
}

// ── Background plane for solid/gradient backgrounds ──────────────────────────
function SceneBackground({ background }: { background: EditorState['background'] }) {
  const { scene } = useThree()

  useEffect(() => {
    if (background.type === 'solid' && background.solidColor) {
      scene.background = new THREE.Color(background.solidColor)
    } else if (background.type === 'gradient') {
      // Gradient via CSS on the canvas container — keep Three.js bg null
      scene.background = null
    } else {
      scene.background = null
    }
    return () => { scene.background = null }
  }, [scene, background])

  return null
}

// ── Camera preset positions ───────────────────────────────────────────────────
const CAMERA_PRESETS: Record<EditorState['cameraAngle'], [number, number, number]> = {
  front:      [0, 0, 18],
  isometric:  [6, 4, 16],
  side:       [14, 2, 8],
}

function CameraController({ angle }: { angle: EditorState['cameraAngle'] }) {
  const { camera } = useThree()
  useEffect(() => {
    const [x, y, z] = CAMERA_PRESETS[angle]
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  }, [angle, camera])
  return null
}

// ── Exporter helper — called by parent via ref ────────────────────────────────
interface ExporterProps {
  onReady: (fn: () => string) => void
}
function Exporter({ onReady }: ExporterProps) {
  const { gl } = useThree()
  useEffect(() => {
    onReady(() => gl.domElement.toDataURL('image/png'))
  }, [gl, onReady])
  return null
}

// ── Main exported component ───────────────────────────────────────────────────
export interface ThreeCanvasRef {
  exportPNG: () => string
}

interface ThreeCanvasProps {
  state: EditorState
  canvasRef?: React.MutableRefObject<ThreeCanvasRef | null>
}

export const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(
  function ThreeCanvas({ state, canvasRef }, _ref) {
    const exportFnRef = useRef<(() => string) | null>(null)

    const device = DEVICE_MODELS[state.deviceId]
    const color = device.colors.find((c) => c.id === state.colorId) ?? device.colors[0]
    const cameraPos = CAMERA_PRESETS[state.cameraAngle]

    useEffect(() => {
      if (canvasRef) {
        canvasRef.current = {
          exportPNG: () => exportFnRef.current?.() ?? '',
        }
      }
    }, [canvasRef])

    const bgStyle: React.CSSProperties =
      state.background.type === 'gradient'
        ? {
            background: `linear-gradient(${state.background.gradientAngle ?? 135}deg, ${state.background.gradientFrom ?? '#667eea'}, ${state.background.gradientTo ?? '#764ba2'})`,
          }
        : state.background.type === 'image' && state.background.imageDataUrl
          ? { backgroundImage: `url(${state.background.imageDataUrl})`, backgroundSize: 'cover' }
          : {}

    return (
      <div className="relative w-full h-full" style={bgStyle}>
        <Canvas
          camera={{ position: cameraPos, fov: 35 }}
          shadows={state.shadow}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <SceneBackground background={state.background} />
          <CameraController angle={state.cameraAngle} />
          <Exporter onReady={(fn) => { exportFnRef.current = fn }} />

          <ambientLight intensity={0.4} />
          <directionalLight
            position={[8, 12, 8]}
            intensity={1.2}
            castShadow={state.shadow}
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-6, 4, -4]} intensity={0.3} />

          <Environment preset="city" />

          <Suspense fallback={null}>
            <PhoneModel
              gltfPath={device.gltfPath}
              colorHex={color.hex}
              screenshotUrl={state.screenshot}
              shadow={state.shadow}
            />
          </Suspense>

          {state.shadow && (
            <ContactShadows
              position={[0, -9, 0]}
              opacity={0.5}
              scale={20}
              blur={2}
              far={12}
            />
          )}

          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={40}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    )
  }
)
