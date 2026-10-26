import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  colorTheme?: 'purple' | 'amber' | 'emerald' | 'blue';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  audioRef,
  colorTheme = 'purple',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Fallback procedural waveform simulation when analyser is not directly attached
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 48;
    const barWidth = 4;
    const gap = 3;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Color gradients
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (colorTheme === 'purple') {
        gradient.addColorStop(0, '#818cf8');
        gradient.addColorStop(0.5, '#c084fc');
        gradient.addColorStop(1, '#f472b6');
      } else if (colorTheme === 'amber') {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#fb923c');
        gradient.addColorStop(1, '#f87171');
      } else if (colorTheme === 'blue') {
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, '#818cf8');
      } else {
        gradient.addColorStop(0, '#34d399');
        gradient.addColorStop(0.5, '#10b981');
        gradient.addColorStop(1, '#06b6d4');
      }

      ctx.fillStyle = gradient;

      const totalBarsWidth = barCount * (barWidth + gap);
      const startX = Math.max(0, (width - totalBarsWidth) / 2);

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        let barHeight = 4;

        if (isPlaying) {
          // Dynamic harmonic motion simulating human speech frequencies
          const sinVal1 = Math.sin(phase * 0.08 + i * 0.25);
          const sinVal2 = Math.cos(phase * 0.05 + i * 0.15);
          const sinVal3 = Math.sin(phase * 0.12 + i * 0.4);
          
          // Speech bell-curve weighting (middle bars are naturally higher)
          const centerWeight = Math.sin((i / barCount) * Math.PI);
          const rawHeight = Math.abs(sinVal1 * 0.5 + sinVal2 * 0.3 + sinVal3 * 0.2) * (height * 0.85);
          barHeight = Math.max(6, rawHeight * (0.3 + 0.7 * centerWeight));
        } else {
          // Gentle resting ripple
          const idleWave = Math.sin(i * 0.3) * 3;
          barHeight = 4 + Math.abs(idleWave);
        }

        const y = centerY - barHeight / 2;
        const radius = barWidth / 2;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 1;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, colorTheme]);

  return (
    <div className="w-full flex items-center justify-center py-2 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
      <canvas
        ref={canvasRef}
        width={420}
        height={54}
        className="w-full max-w-[420px] h-[54px]"
      />
    </div>
  );
};
