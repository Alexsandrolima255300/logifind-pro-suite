import { useEffect, useRef } from "react";

export interface LightfallProps {
  className?: string;
  colors?: string[];
  backgroundColor?: string;
  speed?: number;
  streakCount?: number;
  streakWidth?: number;
  streakLength?: number;
  glow?: number;
  density?: number;
  twinkle?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  zoom?: number;
  backgroundGlow?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

type Particle = {
  x: number;
  y: number;
  length: number;
  width: number;
  speed: number;
  alpha: number;
  phase: number;
  color: string;
};

const DEFAULT_COLORS = ["#FFB15C", "#FF7A00", "#FF4D00"];

export default function Lightfall({
  className = "",
  colors = DEFAULT_COLORS,
  backgroundColor = "#1A0A00",
  speed = 0.5,
  streakCount = 2,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 0.6,
  twinkle = 1,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
}: LightfallProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let last = performance.now();
    const mouse = { x: 0.72, y: 0.45, targetX: 0.72, targetY: 0.45 };
    let particles: Particle[] = [];

    const colorAt = (index: number) => colors[index % Math.max(colors.length, 1)] ?? DEFAULT_COLORS[1];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(18, Math.floor(width * height * 0.00007 * Math.max(density, 0.15)));
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: (35 + Math.random() * 130) * Math.max(streakLength, 0.15),
        width: (0.45 + Math.random() * 1.3) * Math.max(streakWidth, 0.2),
        speed: (20 + Math.random() * 85) * Math.max(speed, 0.05),
        alpha: 0.12 + Math.random() * 0.52,
        phase: Math.random() * Math.PI * 2,
        color: colorAt(i),
      }));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = (event.clientX - rect.left) / rect.width;
      mouse.targetY = (event.clientY - rect.top) / rect.height;
    };

    const draw = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.7;
      const centerY = height * 0.46;
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.72);
      bgGlow.addColorStop(0, `rgba(255, 122, 0, ${0.16 * glow})`);
      bgGlow.addColorStop(0.38, `rgba(255, 89, 0, ${0.07 * glow})`);
      bgGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p) => {
        p.y += p.speed * dt * (0.65 + speed);
        p.x += Math.sin(now * 0.00035 + p.phase) * dt * 10;

        if (p.y - p.length > height) {
          p.y = -p.length * (0.2 + Math.random() * 0.8);
          p.x = Math.random() * width;
        }

        const dx = (mouse.x * width - p.x) / Math.max(width, 1);
        const dy = (mouse.y * height - p.y) / Math.max(height, 1);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = mouseInteraction
          ? Math.max(0, 1 - distance / Math.max(mouseRadius, 0.1)) * mouseStrength
          : 0;
        const x = p.x + dx * influence * 55;
        const y = p.y + dy * influence * 25;
        const flicker = 1 - twinkle * 0.18 + twinkle * 0.18 * Math.sin(now * 0.003 + p.phase);

        const gradient = ctx.createLinearGradient(x, y - p.length, x, y);
        gradient.addColorStop(0, `${p.color}00`);
        gradient.addColorStop(0.55, `${p.color}${Math.round(Math.max(0.08, p.alpha * flicker) * 255).toString(16).padStart(2, "0")}`);
        gradient.addColorStop(1, `${p.color}${Math.round(Math.min(1, p.alpha * flicker * 1.9) * 255).toString(16).padStart(2, "0")}`);

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * glow;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(x, y - p.length);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Soft diagonal light bands create the characteristic Lightfall depth.
      for (let i = 0; i < Math.max(1, streakCount); i++) {
        const offset = ((now * 0.025 * speed + i * (height / Math.max(streakCount, 1))) % (height * 1.6)) - height * 0.6;
        const band = ctx.createLinearGradient(0, offset, width, offset + height * 0.42);
        band.addColorStop(0, "rgba(255,100,0,0)");
        band.addColorStop(0.5, `rgba(255,125,0,${0.025 * glow})`);
        band.addColorStop(1, "rgba(255,100,0,0)");
        ctx.fillStyle = band;
        ctx.beginPath();
        ctx.moveTo(0, offset);
        ctx.lineTo(width, offset + height * 0.42);
        ctx.lineTo(width, offset + height * 0.42 + 24);
        ctx.lineTo(0, offset + 24);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [backgroundColor, colors, density, glow, mouseInteraction, mouseRadius, mouseStrength, opacity, speed, streakCount, streakLength, streakWidth, twinkle]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 h-full w-full ${className}`}
      style={{ opacity, mixBlendMode: "screen" }}
    />
  );
}
