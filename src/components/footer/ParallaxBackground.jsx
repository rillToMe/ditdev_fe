import { useEffect, useRef } from 'react';

import layer1 from '../../assets/footer_parallax/nature/1.png';
import layer2 from '../../assets/footer_parallax/nature/2.png';
import layer3 from '../../assets/footer_parallax/nature/3.png';
import layer4 from '../../assets/footer_parallax/nature/4.png';
import layer5 from '../../assets/footer_parallax/nature/5.png';

const LAYERS = [
  { src: layer1, speed: 0.15, pinBottom: false },
  { src: layer2, speed: 0.25, pinBottom: false },
  { src: layer3, speed: 0.4,  pinBottom: false },
  { src: layer4, speed: 0.6,  pinBottom: false },
  { src: layer5, speed: 1.0,  pinBottom: true  },
];

export default function ParallaxBackground() {
  const canvasRef  = useRef(null);
  const offsetsRef = useRef(LAYERS.map(() => 0));
  const imagesRef  = useRef([]);
  const animRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    LAYERS.forEach((layer, i) => {
      const img  = new Image();
      img.src    = layer.src;
      img.onload = () => { imagesRef.current[i] = img; };
    });

    const resize = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || 400;
      ctx.imageSmoothingEnabled = false;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    const animate = () => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;

      LAYERS.forEach((layer, i) => {
        const img = imagesRef.current[i];
        if (!img?.complete) return;

        // Update offset scroll
        offsetsRef.current[i] = (offsetsRef.current[i] - layer.speed);

        const drawH = H;
        const drawW = (img.width / img.height) * drawH;

        if (Math.abs(offsetsRef.current[i]) >= drawW) {
          offsetsRef.current[i] = offsetsRef.current[i] % drawW;
        }

        let x = offsetsRef.current[i] % drawW;
        if (x > 0) x -= drawW;

        if (layer.pinBottom) {
          const naturalH = Math.min(H, drawH); 
          const yPos     = H - naturalH;        

          while (x < W) {
            ctx.drawImage(img, x, yPos, drawW, naturalH);
            x += drawW;
          }
        } else {
          while (x < W) {
            ctx.drawImage(img, x, 0, drawW, drawH);
            x += drawW;
          }
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}