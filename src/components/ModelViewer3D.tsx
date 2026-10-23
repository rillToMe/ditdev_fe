import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

interface ModelViewer3DProps {
  url: string
  height?: number | string
}

export default function ModelViewer3D({ url, height = 420 }: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const h = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a12)

    const camera = new THREE.PerspectiveCamera(50, width / h, 0.01, 1000)
    camera.position.set(0, 1, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, h)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6)
    dirLight.position.set(3, 5, 4)
    scene.add(dirLight)
    const backLight = new THREE.DirectionalLight(0x88aaff, 0.6)
    backLight.position.set(-3, 2, -4)
    scene.add(backLight)

    const grid = new THREE.GridHelper(10, 20, 0x22d3ee, 0x1e293b)
    grid.position.y = -0.001
    scene.add(grid)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.2

    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? ''

    const fitToView = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z) || 1
      const dist = maxDim * 1.6
      camera.position.set(center.x + dist * 0.6, center.y + dist * 0.5, center.z + dist)
      camera.near = maxDim / 100
      camera.far = maxDim * 100
      camera.updateProjectionMatrix()
      controls.target.copy(center)
      controls.update()
    }

    const onProgress = (e: ProgressEvent) => {
      if (e.total > 0) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    const onError = () => setError('FAILED TO LOAD 3D MODEL')

    let cancelled = false
    const addObject = (object: THREE.Object3D) => {
      if (cancelled) return
      scene.add(object)
      fitToView(object)
      setProgress(null)
    }

    if (ext === 'glb' || ext === 'gltf') {
      new GLTFLoader().load(url, (g) => addObject(g.scene), onProgress, onError)
    } else if (ext === 'fbx') {
      new FBXLoader().load(url, addObject, onProgress, onError)
    } else if (ext === 'obj') {
      new OBJLoader().load(url, addObject, onProgress, onError)
    } else if (ext === 'stl') {
      new STLLoader().load(
        url,
        (geometry) => {
          geometry.computeVertexNormals()
          const material = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.3, roughness: 0.5 })
          addObject(new THREE.Mesh(geometry, material))
        },
        onProgress,
        onError,
      )
    } else {
      setError('UNSUPPORTED MODEL FORMAT')
    }

    const onResize = () => {
      const w = container.clientWidth
      const hh = container.clientHeight
      camera.aspect = w / hh
      camera.updateProjectionMatrix()
      renderer.setSize(w, hh)
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => m.dispose())
        }
      })
      container.removeChild(renderer.domElement)
    }
  }, [url])

  return (
    <div className="model-viewer-3d">
      <div
        ref={containerRef}
        style={{ width: '100%', height }}
        className="model-viewer-canvas"
      />
      {progress !== null && (
        <div className="model-viewer-overlay">LOADING MODEL {progress}%</div>
      )}
      {error && <div className="model-viewer-overlay model-viewer-error">{error}</div>}
      <div className="model-viewer-hint">DRAG TO ROTATE · SCROLL TO ZOOM</div>
    </div>
  )
}
