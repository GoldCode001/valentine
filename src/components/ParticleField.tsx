import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

interface ParticleFieldProps {
  isFormingHeart?: boolean;
  heartProgress?: number;
  particleCount?: number;
}

export function ParticleField({ 
  isFormingHeart = false, 
  heartProgress = 0,
  particleCount = 80 
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  // Generate heart shape points
  const getHeartPoint = (t: number, scale: number, centerX: number, centerY: number) => {
    // Heart parametric equation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
      x: centerX + x * scale,
      y: centerY + y * scale,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      'rgba(255, 77, 109, ',
      'rgba(255, 142, 83, ',
      'rgba(201, 177, 255, ',
      'rgba(255, 255, 255, ',
    ];

    // Initialize particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const t = (i / particleCount) * Math.PI * 2;
      const heartPoint = getHeartPoint(t, 8, centerX, centerY);
      
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: heartPoint.x,
        targetY: heartPoint.y,
        size: 2 + Math.random() * 3,
        speed: 0.02 + Math.random() * 0.03,
        opacity: 0.3 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particlesRef.current.forEach((particle, i) => {
        // Update heart target based on current canvas size
        const t = (i / particleCount) * Math.PI * 2;
        const heartPoint = getHeartPoint(t, 10 * heartProgress, centerX, centerY);
        particle.targetX = heartPoint.x;
        particle.targetY = heartPoint.y;

        if (isFormingHeart && heartProgress > 0) {
          // Move towards heart shape
          particle.x += (particle.targetX - particle.x) * particle.speed * heartProgress;
          particle.y += (particle.targetY - particle.y) * particle.speed * heartProgress;
        } else {
          // Gentle floating
          particle.y -= 0.2;
          particle.x += Math.sin(Date.now() * 0.001 + i) * 0.3;
          
          if (particle.y < -10) particle.y = canvas.height + 10;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + particle.opacity + ')';
        ctx.fill();

        // Glow effect
        if (isFormingHeart && heartProgress > 0.5) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = particle.color + (particle.opacity * 0.3) + ')';
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFormingHeart, heartProgress, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
