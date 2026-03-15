import { useEffect, useRef } from 'react';
import runSprite from '../../assets/footer_parallax/knight/_Run.png';

const FRAME_WIDTH  = 120;  
const FRAME_HEIGHT = 80;
const TOTAL_FRAMES = 10;
const FPS          = 12;
const SCALE        = 2;

const BOTTOM_OFFSET = 18;

export default function KnightRunner() {
  const canvasRef = useRef(null);
  const frameRef  = useRef(0);
  const animRef   = useRef(null);
  const lastTime  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    canvas.width  = FRAME_WIDTH  * SCALE;
    canvas.height = FRAME_HEIGHT * SCALE;
    ctx.imageSmoothingEnabled = false;

    const sprite = new Image();
    sprite.src   = runSprite;

    const interval = 1000 / FPS;

    const animate = (timestamp) => {
      if (!sprite.complete) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      if (timestamp - lastTime.current >= interval) {
        lastTime.current = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(
          sprite,
          frameRef.current * FRAME_WIDTH, 0,
          FRAME_WIDTH, FRAME_HEIGHT,
          0, 0,
          FRAME_WIDTH  * SCALE,
          FRAME_HEIGHT * SCALE
        );

        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        imageRendering : 'pixelated',
        width          : `${FRAME_WIDTH  * SCALE}px`,
        height         : `${FRAME_HEIGHT * SCALE}px`,
        position       : 'absolute',
        bottom         : `${BOTTOM_OFFSET}px`,   
        left           : '80px',
        zIndex         : 30,
      }}
    />
  );
}