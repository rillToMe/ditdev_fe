import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';

const sliderStyle = `
  .pixel-slider { appearance: none; width: 100%; height: 3px; background: rgba(79,140,255,0.15); cursor: pointer; border: none; }
  .pixel-slider::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; background: #4f8cff; cursor: pointer; clip-path: polygon(0 0,100% 0,100% 100%,0 100%); box-shadow: 0 0 8px rgba(79,140,255,0.5); }
  .pixel-slider::-moz-range-thumb { width: 14px; height: 14px; background: #4f8cff; cursor: pointer; border: none; border-radius: 0; box-shadow: 0 0 8px rgba(79,140,255,0.5); }
  .pixel-slider::-webkit-slider-runnable-track { background: rgba(79,140,255,0.12); }
`;

export default function ImageCropper({ image, onComplete, onCancel, aspectRatio = 16 / 9 }) {
  const [crop,               setCrop]               = useState({ x: 0, y: 0 });
  const [zoom,               setZoom]               = useState(1);
  const [rotation,           setRotation]           = useState(0);
  const [croppedAreaPixels,  setCroppedAreaPixels]  = useState(null);

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const createCroppedImage = async () => {
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels, rotation);
      onComplete(blob);
    } catch (e) {
      console.error('Crop error:', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: '#050709' }}
    >
      <style>{sliderStyle}</style>

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-4"
        style={{ background: '#0a0e1a', borderBottom: '1px solid rgba(79,140,255,0.12)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#4f8cff]" />
            <div className="w-2 h-2 bg-[#00d4ff]/60" />
          </div>
          <div>
            <p className="font-pixel text-xs tracking-widest text-[#e2e8f0]">// CROP_IMAGE</p>
            <p className="font-mono text-[9px] mt-0.5" style={{ color: 'rgba(148,163,184,0.35)' }}>
              Drag to reposition · scroll to zoom
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="p-1.5 transition-colors"
          style={{ color: 'rgba(148,163,184,0.4)', background: 'rgba(79,140,255,0.05)', border: '1px solid rgba(79,140,255,0.1)', clipPath: pixelClip }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
        >
          <X className="w-5 h-5" />
        </motion.button>
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
            containerStyle: { background: '#050709' },
            cropAreaStyle : { border: '2px solid rgba(79,140,255,0.6)', boxShadow: '0 0 0 9999px rgba(5,7,9,0.75)' },
          }}
        />
      </div>

      {/* Controls */}
      <div
        className="flex-shrink-0 px-6 py-6"
        style={{ background: '#0a0e1a', borderTop: '1px solid rgba(79,140,255,0.1)' }}
      >
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-pixel text-[9px] tracking-widest" style={{ color: 'rgba(79,140,255,0.6)' }}>
                <ZoomIn className="w-3.5 h-3.5" /> ZOOM
              </span>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>{Math.round(zoom * 100)}%</span>
            </div>
            <input type="range" min={1} max={3} step={0.1} value={zoom}
              onChange={e => setZoom(+e.target.value)} className="pixel-slider" />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-pixel text-[9px] tracking-widest" style={{ color: 'rgba(79,140,255,0.6)' }}>
                <RotateCw className="w-3.5 h-3.5" /> ROTATE
              </span>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>{rotation}°</span>
            </div>
            <input type="range" min={0} max={360} step={1} value={rotation}
              onChange={e => setRotation(+e.target.value)} className="pixel-slider" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 py-3 font-pixel text-[10px] tracking-widest border border-[rgba(148,163,184,0.15)] text-[rgba(148,163,184,0.4)] hover:text-[rgba(148,163,184,0.7)] hover:border-[rgba(148,163,184,0.3)] transition-all"
              style={{ clipPath: pixelClip }}
            >
              CANCEL
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={createCroppedImage}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-pixel text-[10px] tracking-widest transition-all duration-200"
              style={{ background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.35)', color: '#4f8cff', clipPath: pixelClip }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,140,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,140,255,0.12)'}
            >
              <Check className="w-4 h-4" />
              APPLY CROP
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const createImage = (url) => new Promise((res, rej) => {
  const img = new Image();
  img.addEventListener('load',  () => res(img));
  img.addEventListener('error', rej);
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url;
});

const toRad = (deg) => (deg * Math.PI) / 180;

const rotateSize = (w, h, rotation) => {
  const r = toRad(rotation);
  return { width: Math.abs(Math.cos(r) * w) + Math.abs(Math.sin(r) * h), height: Math.abs(Math.sin(r) * w) + Math.abs(Math.cos(r) * h) };
};

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image  = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  if (!ctx) return null;

  const { width: bw, height: bh } = rotateSize(image.width, image.height, rotation);
  canvas.width  = bw;
  canvas.height = bh;

  ctx.translate(bw / 2, bh / 2);
  ctx.rotate(toRad(rotation));
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise(res => canvas.toBlob(blob => res(blob), 'image/jpeg', 0.95));
}