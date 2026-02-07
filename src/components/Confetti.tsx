import { useEffect, useRef } from 'react';

interface ConfettiPiece {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speedY: number;
  speedX: number;
  color: string;
  size: number;
  opacity: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

export function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colors = [
    '#DC2626',
    '#E11D48',
    '#16A34A',
    '#F43F5E',
    '#FFFFFF',
    '#B91C1C',
  ];

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti pieces
    piecesRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      speedY: 2 + Math.random() * 4,
      speedX: (Math.random() - 0.5) * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      opacity: 0.8 + Math.random() * 0.2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activePieces = 0;

      piecesRef.current.forEach(piece => {
        if (piece.y < canvas.height + 20) {
          activePieces++;
          
          // Update position
          piece.y += piece.speedY;
          piece.x += piece.speedX;
          piece.rotation += piece.rotationSpeed;
          
          // Add gravity effect
          piece.speedY += 0.05;
          
          // Draw confetti
          ctx.save();
          ctx.translate(piece.x, piece.y);
          ctx.rotate((piece.rotation * Math.PI) / 180);
          ctx.fillStyle = piece.color;
          ctx.globalAlpha = piece.opacity;
          
          // Draw rectangle (confetti shape)
          ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
          
          ctx.restore();
        }
      });

      if (activePieces > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    // Stop after duration
    timeoutRef.current = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }, duration);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, duration]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
}
