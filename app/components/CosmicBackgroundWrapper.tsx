"use client";

import { useEffect, useRef, useState } from "react";

// ─── Advanced Cosmic Background ───────────────────────────────────────────
interface CosmicObject {
  id: number;
  type: "planet" | "galaxy" | "blackhole";
  x: number; // percentage
  y: number; // percentage
  size: number; // pixels - now very small
  image: string;
  rotationSpeed: number;
  pulseSpeed?: number;
  glowIntensity: number;
  zIndex: number;
}

function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Cosmic objects configuration - sizes made very small
  const cosmicObjects: CosmicObject[] = [
    {
      id: 1,
      type: "blackhole",
      x: 25,
      y: 40,
      size: 60, // Was 280 - now very small
      image: "/blackHole.png",
      rotationSpeed: 0.003,
      glowIntensity: 0.5,
      zIndex: 3,
    },
    {
      id: 2,
      type: "planet",
      x: 70,
      y: 30,
      size: 45, // Was 180 - now very small
      image: "/earth.png",
      rotationSpeed: 0.001,
      glowIntensity: 0.3,
      zIndex: 2,
    },
    {
      id: 3,
      type: "planet",
      x: 80,
      y: 75,
      size: 40, // Was 150 - now very small
      image: "/mars.png",
      rotationSpeed: 0.0012,
      glowIntensity: 0.35,
      zIndex: 2,
    },
  ];

  // Star field without mouse parallax
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars - some static, some twinkling, some moving
    const stars = {
      // Static stars (no movement, just twinkling)
      static: Array.from({ length: 500 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      })),
      
      // Slowly drifting stars (4-5 of them)
      drifting: Array.from({ length: 5 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
      })),
    };

    // Shooting stars
    interface ShootingStar {
      active: boolean;
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
      alpha: number;
      trail: { x: number; y: number; alpha: number }[];
    }
    
    let shootingStars: ShootingStar[] = [];
    
    // Create a new shooting star
    const createShootingStar = () => {
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? -50 : canvas.width + 50;
      const startY = Math.random() * canvas.height * 0.5;
      const angle = Math.random() * Math.PI / 3 + Math.PI / 6; // 30-60 degrees
      const speed = Math.random() * 8 + 6;
      
      return {
        active: true,
        x: startX,
        y: startY,
        speedX: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        speedY: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1.5,
        alpha: 0.8,
        trail: [] as { x: number; y: number; alpha: number }[],
      };
    };
    
    // Schedule shooting stars at random intervals
    let nextShootingStarTime = Math.random() * 8000 + 4000; // 4-12 seconds
    
    let animationId: number;
    let lastTimestamp = 0;

    const drawStars = () => {
      // Draw static stars (twinkling only)
      stars.static.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.alpha * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
        ctx.fill();
      });
      
      // Draw drifting stars (moving slowly)
      stars.drifting.forEach((star) => {
        // Update position
        star.x += star.speedX;
        star.y += star.speedY;
        
        // Wrap around edges
        if (star.x < -50) star.x = canvas.width + 50;
        if (star.x > canvas.width + 50) star.x = -50;
        if (star.y < -50) star.y = canvas.height + 50;
        if (star.y > canvas.height + 50) star.y = -50;
        
        // Update twinkle
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.alpha * twinkle;
        
        // Draw glow effect for drifting stars
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 150, ${alpha * 0.3})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
        ctx.fill();
      });
    };
    
    const drawShootingStars = () => {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        
        // Update position
        star.x += star.speedX;
        star.y += star.speedY;
        
        // Add current position to trail
        star.trail.unshift({ x: star.x, y: star.y, alpha: 0.7 });
        
        // Keep trail length limited
        if (star.trail.length > 15) star.trail.pop();
        
        // Fade trail
        star.trail.forEach((point, idx) => {
          point.alpha = 0.7 * (1 - idx / star.trail.length);
        });
        
        // Draw trail
        for (let j = 0; j < star.trail.length; j++) {
          const point = star.trail[j];
          ctx.beginPath();
          ctx.arc(point.x, point.y, star.size * (1 - j / star.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 150, ${point.alpha * 0.5})`;
          ctx.fill();
        }
        
        // Draw star head
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${star.alpha})`;
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${star.alpha * 0.3})`;
        ctx.fill();
        
        // Deactivate if off screen
        if (star.x < -200 || star.x > canvas.width + 200 || 
            star.y < -200 || star.y > canvas.height + 200) {
          shootingStars.splice(i, 1);
        }
      }
    };
    
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Deep space gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#020410");
      gradient.addColorStop(0.5, "#030818");
      gradient.addColorStop(1, "#010208");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw all stars
      drawStars();
      drawShootingStars();
      
      // Check for new shooting star
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      
      if (nextShootingStarTime <= 0 && shootingStars.length < 2) {
        shootingStars.push(createShootingStar());
        nextShootingStarTime = Math.random() * 12000 + 6000; // 6-18 seconds between shooting stars
      } else {
        nextShootingStarTime -= delta;
      }
      
      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Render cosmic images - no mouse parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {cosmicObjects.map((obj) => (
          <CosmicImage key={obj.id} object={obj} />
        ))}
      </div>
    </>
  );
}

// ─── Individual Cosmic Object with Animations (no mouse parallax) ─────────
function CosmicImage({ object }: { object: CosmicObject }) {
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setRotation(prev => prev + object.rotationSpeed);
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [object.rotationSpeed]);
  
  // No parallax - fixed positions
  const leftPos = `${object.x}%`;
  const topPos = `${object.y}%`;
  
  return (
    <div
      ref={imageRef}
      className="absolute"
      style={{
        left: leftPos,
        top: topPos,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: object.size,
        height: object.size,
        zIndex: object.zIndex,
        filter: `drop-shadow(0 0 ${object.glowIntensity * 15}px rgba(100, 150, 255, ${object.glowIntensity * 0.3}))`,
      }}
    >
      {/* Black hole accretion disk effect - scaled down */}
      {object.type === "blackhole" && (
        <div
          className="absolute rounded-full animate-spin-slow"
          style={{
            width: "50%",
            height: "50%",
            left: "-25%",
            top: "-25%",
            background: "conic-gradient(from 0deg, transparent, rgba(255,100,50,0.4), rgba(255,50,100,0.3), transparent)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        />
      )}
      
      {/* Planet atmosphere glow - scaled down */}
      {object.type === "planet" && (
        <div
          className="absolute rounded-full animate-pulse-slow"
          style={{
            width: "50%",
            height: "50%",
            left: "-15%",
            top: "-15%",
            background: `radial-gradient(circle, rgba(100,150,255,0.2), transparent)`,
            filter: "blur(6px)",
          }}
        />
      )}
      
      {/* Black hole event horizon effect - scaled down */}
      {object.type === "blackhole" && (
        <div
          className="absolute rounded-full"
          style={{
            width: "20%",
            height: "20%",
            left: "40%",
            top: "40%",
            background: "radial-gradient(circle, rgba(0,0,0,0.9), rgba(0,0,0,0.95))",
            borderRadius: "50%",
            boxShadow: "inset 0 0 10px rgba(255,100,50,0.6)",
          }}
        />
      )}
      
      {/* The actual image */}
      <img
        src={object.image}
        alt={object.type}
        className="w-full h-full object-contain"
        style={{
          filter: object.type === "blackhole" ? "brightness(1.1) contrast(1.2)" : "brightness(1)",
        }}
      />
    </div>
  );
}

// ─── Main Export Component ──────────────────────────────────────────────
export default function CosmicBackgroundWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <CosmicBackground />
      {children && <div className="relative z-20">{children}</div>}
    </div>
  );
}

// Add these animations to your global CSS or style tag
const animations = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
  
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-5px) translateX(5px); }
    50% { transform: translateY(0px) translateX(10px); }
    75% { transform: translateY(5px) translateX(5px); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
  }
`;

// Inject animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = animations;
  document.head.appendChild(styleSheet);
}