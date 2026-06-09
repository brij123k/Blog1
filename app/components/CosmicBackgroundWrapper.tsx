"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Advanced Cosmic Background ───────────────────────────────────────────
interface CosmicObject {
  id: number;
  type: "planet" | "galaxy" | "blackhole";
  x: number; // percentage
  y: number; // percentage
  size: number; // pixels
  image: string;
  rotationSpeed: number;
  pulseSpeed?: number;
  glowIntensity: number;
  zIndex: number;
}

function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Cosmic objects configuration
  const cosmicObjects: CosmicObject[] = [
    {
      id: 1,
      type: "blackhole",
      x: 15,
      y: 35,
      size: 280,
      image: "/blackHole.png",
      rotationSpeed: 0.002,
      glowIntensity: 0.8,
      zIndex: 3,
    },
    {
      id: 2,
      type: "planet",
      x: 75,
      y: 20,
      size: 180,
      image: "/earth.png",
      rotationSpeed: 0.0005,
      glowIntensity: 0.4,
      zIndex: 2,
    },
    {
      id: 3,
      type: "planet",
      x: 85,
      y: 70,
      size: 150,
      image: "/mars.png",
      rotationSpeed: 0.0008,
      glowIntensity: 0.5,
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
      static: Array.from({ length: 400 }, () => ({
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
  const [pulseScale, setPulseScale] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setRotation(prev => prev + object.rotationSpeed);
      
      if (object.type === "blackhole") {
        setPulseScale(prev => {
          const newScale = 1 + Math.sin(Date.now() * 0.002) * 0.03;
          return newScale;
        });
      } else if (object.type === "planet") {
        setPulseScale(prev => 1 + Math.sin(Date.now() * 0.001) * 0.01);
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [object.rotationSpeed, object.type]);
  
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
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${pulseScale})`,
        width: object.size,
        height: object.size,
        zIndex: object.zIndex,
        filter: `drop-shadow(0 0 ${object.glowIntensity * 40}px rgba(100, 150, 255, ${object.glowIntensity * 0.5}))`,
      }}
    >
      {/* Black hole accretion disk effect */}
      {object.type === "blackhole" && (
        <div
          className="absolute rounded-full animate-spin-slow"
          style={{
            width: "130%",
            height: "130%",
            left: "-15%",
            top: "-15%",
            background: "conic-gradient(from 0deg, transparent, rgba(255,100,50,0.3), rgba(255,50,100,0.2), transparent)",
            borderRadius: "50%",
            filter: "blur(8px)",
          }}
        />
      )}
      
      {/* Planet atmosphere glow */}
      {object.type === "planet" && (
        <div
          className="absolute rounded-full animate-pulse-slow"
          style={{
            width: "120%",
            height: "120%",
            left: "-10%",
            top: "-10%",
            background: `radial-gradient(circle, rgba(100,150,255,0.2), transparent)`,
            filter: "blur(12px)",
          }}
        />
      )}
      
      {/* Black hole event horizon effect */}
      {object.type === "blackhole" && (
        <div
          className="absolute rounded-full"
          style={{
            width: "60%",
            height: "60%",
            left: "20%",
            top: "20%",
            background: "radial-gradient(circle, rgba(0,0,0,0.8), rgba(0,0,0,0.9))",
            borderRadius: "50%",
            boxShadow: "inset 0 0 20px rgba(255,100,50,0.5)",
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
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
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