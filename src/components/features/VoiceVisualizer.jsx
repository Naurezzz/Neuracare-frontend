import { useEffect, useRef } from 'react';

const VoiceVisualizer = ({ isActive }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bars = 40;
    const barWidth = canvas.width / bars;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height * 0.8;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#9333EA');
        gradient.addColorStop(1, '#EC4899');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, height);
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="w-full h-24 flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="rounded-lg"
      />
    </div>
  );
};

export default VoiceVisualizer;
