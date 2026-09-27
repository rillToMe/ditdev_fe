import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { X, Check, RotateCw, ZoomIn } from 'lucide-react'
import { btn } from '../ui'

interface ImageCropperProps {
  image: string
  onComplete: (blob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: 'var(--a-accent)',
  cursor: 'pointer',
}

export default function ImageCropper({ image, onComplete, onCancel, aspectRatio = 16 / 9 }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => setCroppedAreaPixels(pixels), [])

  const createCroppedImage = async () => {
    try {
      if (!croppedAreaPixels) return
      const blob = await getCroppedImg(image, croppedAreaPixels, rotation)
      if (blob) onComplete(blob)
    } catch (e) {
      console.error('Crop error:', e)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col"
      style={{ background: 'var(--a-bg)' }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between"
        style={{ padding: '14px 20px', background: 'var(--a-surface)', borderBottom: '1px solid var(--a-border-soft)' }}
      >
        <div>
          <p style={{ fontSize: 15, fontWeight: 650 }}>Crop image</p>
          <p style={{ fontSize: 12, color: 'var(--a-muted)', marginTop: 2 }}>
            Drag to reposition · scroll to zoom
          </p>
        </div>
        <button className="admin-iconbtn" onClick={onCancel} aria-label="Cancel crop">
          <X size={18} />
        </button>
      </div>

      {/* Cropper area */}
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: 'var(--a-bg)' },
            cropAreaStyle: { border: '2px solid var(--a-accent)', boxShadow: '0 0 0 9999px rgba(5,7,10,0.72)' },
          }}
        />
      </div>

      {/* Controls */}
      <div
        className="flex-shrink-0"
        style={{ padding: '20px 20px 24px', background: 'var(--a-surface)', borderTop: '1px solid var(--a-border-soft)' }}
      >
        <div className="mx-auto space-y-5" style={{ maxWidth: 640 }}>

          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text-dim)' }}>
                <ZoomIn size={15} /> Zoom
              </span>
              <span className="admin-num" style={{ fontSize: 12.5, color: 'var(--a-muted)' }}>{Math.round(zoom * 100)}%</span>
            </div>
            <input type="range" min={1} max={3} step={0.1} value={zoom}
              onChange={(e) => setZoom(+e.target.value)} style={sliderStyle} />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text-dim)' }}>
                <RotateCw size={15} /> Rotate
              </span>
              <span className="admin-num" style={{ fontSize: 12.5, color: 'var(--a-muted)' }}>{rotation}°</span>
            </div>
            <input type="range" min={0} max={360} step={1} value={rotation}
              onChange={(e) => setRotation(+e.target.value)} style={sliderStyle} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel} className={btn.ghost + ' flex-1'}>
              Cancel
            </button>
            <button onClick={createCroppedImage} className={btn.primary + ' flex-1'}>
              <Check size={16} />
              Apply crop
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const createImage = (url: string) => new Promise<HTMLImageElement>((res, rej) => {
  const img = new Image()
  img.addEventListener('load', () => res(img))
  img.addEventListener('error', rej)
  img.setAttribute('crossOrigin', 'anonymous')
  img.src = url
})

const toRad = (deg: number) => (deg * Math.PI) / 180

const rotateSize = (w: number, h: number, rotation: number) => {
  const r = toRad(rotation)
  return { width: Math.abs(Math.cos(r) * w) + Math.abs(Math.sin(r) * h), height: Math.abs(Math.sin(r) * w) + Math.abs(Math.cos(r) * h) }
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { width: bw, height: bh } = rotateSize(image.width, image.height, rotation)
  canvas.width = bw
  canvas.height = bh

  ctx.translate(bw / 2, bh / 2)
  ctx.rotate(toRad(rotation))
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.putImageData(data, 0, 0)

  return new Promise<Blob | null>((res) => canvas.toBlob((blob) => res(blob), 'image/jpeg', 0.95))
}
