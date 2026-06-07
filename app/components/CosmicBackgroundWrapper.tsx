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
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
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

  // Star field with parallax effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // const handleMouseMove = (e: MouseEvent) => {
    //   setMousePosition({
    //     x: e.clientX / window.innerWidth,
    //     y: e.clientY / window.innerHeight,
    //   });
    // };

    // window.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars with different sizes and depths (for parallax)
    const stars = Array.from({ length: 800 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      depth: Math.random(), // 0 = far, 1 = near
      alpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Create distant galaxies (small blurry clusters)
    const galaxies = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 40 + 20,
      alpha: Math.random() * 0.15,
      rotation: Math.random() * Math.PI * 2,
    }));

    let animationId: number;

    const drawStars = (parallaxX: number, parallaxY: number) => {
      stars.forEach((star) => {
        // Parallax effect - nearer stars move more
        const offsetX = (parallaxX - 0.5) * star.depth * 30;
        const offsetY = (parallaxY - 0.5) * star.depth * 30;
        
        let x = star.x + offsetX;
        let y = star.y + offsetY;
        
        // Wrap around edges
        if (x < 0) x += canvas.width;
        if (x > canvas.width) x -= canvas.width;
        if (y < 0) y += canvas.height;
        if (y > canvas.height) y -= canvas.height;
        
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.alpha * twinkle;
        
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
        ctx.fill();
        
        // Update twinkle
        star.twinklePhase += star.twinkleSpeed;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Deep space gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#020410");
      gradient.addColorStop(0.5, "#030818");
      gradient.addColorStop(1, "#010208");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars with parallax
      drawStars(mousePosition.x, mousePosition.y);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mousePosition]);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Render cosmic images */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {cosmicObjects.map((obj) => (
          <CosmicImage key={obj.id} object={obj} mousePosition={mousePosition} />
        ))}
      </div>
    </>
  );
}

// ─── Individual Cosmic Object with Animations ───────────────────────────
function CosmicImage({ object, mousePosition }: { object: CosmicObject; mousePosition: { x: number; y: number } }) {
  const [rotation, setRotation] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setRotation(prev => prev + object.rotationSpeed);
      
      if (object.type === "blackhole") {
        // Black hole pulses
        setPulseScale(prev => {
          const newScale = 1 + Math.sin(Date.now() * 0.002) * 0.03;
          return newScale;
        });
      } else if (object.type === "planet") {
        // Planets have subtle pulsing
        setPulseScale(prev => 1 + Math.sin(Date.now() * 0.001) * 0.01);
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [object.rotationSpeed, object.type]);
  
  // Parallax effect based on mouse position
  const parallaxX = (mousePosition.x - 0.5) * 20;
  const parallaxY = (mousePosition.y - 0.5) * 15;
  
  // Calculate position with parallax
  const leftPos = `calc(${object.x}% + ${parallaxX * (object.type === "blackhole" ? 0.3 : 0.5)}px)`;
  const topPos = `calc(${object.y}% + ${parallaxY * (object.type === "blackhole" ? 0.3 : 0.5)}px)`;
  
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

// ─── Floating Astronaut (can be placed anywhere) ────────────────────────
// function FloatingAstronaut({ mousePosition }: { mousePosition: { x: number; y: number } }) {
//   const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });
  
//   useEffect(() => {
//     let animationId: number;
//     let startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       setFloatOffset({
//         x: Math.sin(elapsed * 0.001) * 15,
//         y: Math.cos(elapsed * 0.0008) * 12,
//       });
//       animationId = requestAnimationFrame(animate);
//     };
    
//     animate();
//     return () => cancelAnimationFrame(animationId);
//   }, []);
  
//   // Parallax follows mouse
//   const parallaxX = (mousePosition.x - 0.5) * 40;
//   const parallaxY = (mousePosition.y - 0.5) * 30;
  
//   return (
//     <div
//       className="fixed pointer-events-none"
//       style={{
//         right: "5%",
//         bottom: "15%",
//         width: "280px",
//         zIndex: 10,
//         transform: `translate(${parallaxX + floatOffset.x}px, ${parallaxY + floatOffset.y}px) rotate(-8deg)`,
//         filter: "drop-shadow(0 0 30px rgba(100,150,255,0.4))",
//       }}
//     >
//       <img src="/astronot.png" alt="Floating Astronaut" className="w-full h-auto" />
//     </div>
//   );
// }

// ─── Portal Effect (Stylized) ──────────────────────────────────────────
function PortalEffect() {
  const portalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const portal = portalRef.current;
    if (!portal) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = portal.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angleX = (e.clientY - centerY) / 20;
      const angleY = (e.clientX - centerX) / 20;
      
      portal.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  return (
    <div
      ref={portalRef}
      className="fixed pointer-events-none transition-transform duration-200 ease-out"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        height: "500px",
        zIndex: 2,
        opacity: 0.15,
      }}
    >
      <div className="absolute inset-0 rounded-full animate-spin-slow">
        <div className="absolute inset-0 rounded-full" style={{
          background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
          filter: "blur(30px)",
          animation: "spin 8s linear infinite",
        }} />
      </div>
      <div className="absolute inset-[20%] rounded-full" style={{
        background: "radial-gradient(circle, rgba(59,130,246,0.3), transparent)",
        filter: "blur(20px)",
      }} />
    </div>
  );
}

// ─── Main Export Component ──────────────────────────────────────────────
export default function CosmicBackgroundWrapper({ children }: { children?: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <CosmicBackground />
      <PortalEffect />
      {/* <FloatingAstronaut mousePosition={mousePosition} /> */}
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