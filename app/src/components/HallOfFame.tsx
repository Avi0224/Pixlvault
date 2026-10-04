"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage, OrbitControls } from "@react-three/drei";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import Link from "next/link";
import { X } from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

function MotionBlurEffect({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  const lastQuat = useRef(new THREE.Quaternion());
  const lastPos = useRef(new THREE.Vector3());
  const currentBlur = useRef(0);
  
  useFrame((state) => {
    const angle = lastQuat.current.angleTo(state.camera.quaternion);
    const dist = lastPos.current.distanceTo(state.camera.position);
    
    lastQuat.current.copy(state.camera.quaternion);
    lastPos.current.copy(state.camera.position);
    
    // Reduced multipliers for a subtle, premium motion blur
    const targetBlur = Math.min(4, (angle * 150) + (dist * 2));
    
    // Smooth the blur for a natural trail effect
    currentBlur.current = THREE.MathUtils.lerp(currentBlur.current, targetBlur, 0.15);
    
    if (containerRef.current) {
      if (currentBlur.current > 0.1) {
         containerRef.current.style.filter = `blur(${currentBlur.current.toFixed(1)}px)`;
      } else {
         containerRef.current.style.filter = `none`;
      }
    }
  });
  return null;
}

function IntroCameraAnim({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const LOOP_LENGTH = 3000;
  
  useFrame((state) => {
    // Calculate infinite loop progress (0.0 to 1.0)
    const rawProgress = scrollRef.current / LOOP_LENGTH;
    const loopProgress = ((rawProgress % 1) + 1) % 1;
    
    // 0.0 to 0.15: wait at distance 45 (aperture opening)
    // 0.15 to 0.85: fly from distance 45 down to 1
    // 0.85 to 1.0: wait at distance 1 (aperture closing)
    let targetDist = 45;
    if (loopProgress > 0.15 && loopProgress < 0.85) {
       const flightProgress = (loopProgress - 0.15) / 0.70;
       // We stop at 1 instead of 0 to avoid OrbitControls singularity
       targetDist = 45 - (flightProgress * 44); 
    } else if (loopProgress >= 0.85) {
       targetDist = 1;
    }
    
    // Smoothly interpolate current distance
    const currentDist = state.camera.position.length();
    const nextDist = THREE.MathUtils.lerp(currentDist, targetDist, 0.1);
    
    // Apply new distance while preserving rotation (OrbitControls handles rotation)
    if (nextDist > 0) {
      state.camera.position.setLength(nextDist);
    }
  });
  return null;
}

function SphereGallery({ photos, onSelect }: { photos: any[], onSelect: (photo: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Calculate spherical positions with fixed 25 slots for consistent wide spacing
  const positions = useMemo(() => {
    const pos = [];
    const radius = 6; 
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const totalSlots = Math.max(15, photos.length); 
    
    for (let i = 0; i < photos.length; i++) {
      const virtualIndex = photos.length > 1 ? i * (totalSlots / photos.length) : totalSlots / 2;
      const y = 1 - (virtualIndex / (totalSlots - 1)) * 2; 
      const r = Math.sqrt(1 - y * y); 
      const theta = phi * virtualIndex; 
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      pos.push(new THREE.Vector3(x * radius, y * radius, z * radius));
    }
    return pos;
  }, [photos]);

  return (
    <group ref={groupRef}>
      {photos.map((photo, i) => {
        const position = positions[i];
        const rotation = new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            position.clone().normalize()
          )
        );

        const isHovered = hovered === photo.id;

        return (
          <group key={photo.id} position={position} rotation={rotation}>
            <DreiImage
              url={photo.storageUrl}
              transparent
              opacity={isHovered ? 1 : 0.8}
              scale={isHovered ? [3.2, 2.1] : [2.8, 1.8]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(photo.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                setHovered(null);
                document.body.style.cursor = 'auto';
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(photo);
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function HallOfFame() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);
  const apertureRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, "photos"),
          where("status", "==", "approved"),
          where("featured", "==", true)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPhotos(fetched);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFeatured();
  }, []);

  // Handle Scroll Engine & DOM Animations (GPU Accelerated)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollRef.current += e.deltaY;
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      scrollRef.current += deltaY * 2;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    const LOOP_LENGTH = 3000;
    let animationFrameId: number;

    const renderLoop = () => {
      const rawProgress = scrollRef.current / LOOP_LENGTH;
      const loopProgress = ((rawProgress % 1) + 1) % 1;
      
      // Aperture Scale Logic
      let scale = 2; // Fully open
      if (loopProgress < 0.15) {
         scale = (loopProgress / 0.15) * 2; // Opening
      } else if (loopProgress > 0.85) {
         scale = ((1.0 - loopProgress) / 0.15) * 2; // Closing
      }
      
      if (apertureRef.current) {
        apertureRef.current.style.transform = `scale(${scale})`;
        apertureRef.current.style.border = scale > 0.05 ? '2px solid rgba(255,255,255,0.1)' : 'none';
        apertureRef.current.style.pointerEvents = scale > 1.5 ? 'none' : 'auto';
      }
      
      if (textRef.current) {
         let opacity = 1;
         if (loopProgress < 0.1) opacity = 1 - (loopProgress / 0.1);
         else if (loopProgress > 0.9) opacity = (loopProgress - 0.9) / 0.1;
         else opacity = 0;
         
         textRef.current.style.opacity = opacity.toString();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative" style={{ touchAction: 'none' }}>
      
      {/* 3D Canvas Container - Subtle Motion blur applied here */}
      <div ref={canvasContainerRef} className="w-full h-full absolute inset-0 transition-[filter] duration-[50ms]">
        <Canvas camera={{ position: [0, 0, 45], fov: 60 }}>
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.5} />
          
          <IntroCameraAnim scrollRef={scrollRef} />
          <MotionBlurEffect containerRef={canvasContainerRef} />
          
          {photos.length > 0 && <SphereGallery photos={photos} onSelect={setSelectedPhoto} />}
          
          <OrbitControls 
            enableZoom={false} // Zoom is handled entirely by the infinite scroll loop
            enablePan={false} 
            autoRotate={!selectedPhoto} 
            autoRotateSpeed={0.8}
          />
        </Canvas>
      </div>
      
      {/* Empty State */}
      {photos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 uppercase tracking-widest text-sm pointer-events-none z-10">
          No featured artwork yet
        </div>
      )}
      
      {/* 3D Interaction Helper */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-[0.3em] uppercase pointer-events-none transition-opacity duration-300 ${selectedPhoto ? 'opacity-0' : 'opacity-100'} z-10`}>
        Drag to rotate • Scroll to fly
      </div>

      {/* GPU Accelerated Impactful Aperture Mask */}
      <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
        <div 
          ref={apertureRef}
          className="rounded-full bg-transparent will-change-transform"
          style={{
            width: '100vmax',
            height: '100vmax',
            boxShadow: '0 0 0 200vmax black, inset 0 0 100px rgba(0,0,0,0.8)',
            transform: 'scale(0)', 
            transformOrigin: 'center center',
          }}
        />
        
        {/* Intro Text */}
        <div 
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none will-change-opacity"
        >
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-white text-4xl md:text-6xl font-light tracking-[0.4em] uppercase text-center px-4 drop-shadow-2xl">
              Photography Platform
            </h1>
          </div>
          <p className="absolute bottom-12 text-white/50 text-xs tracking-[0.3em] uppercase animate-pulse">
            Scroll to enter
          </p>
        </div>
      </div>

      {/* 2D Selected Photo Overlay */}
      <div 
        className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500 cursor-pointer p-6 ${selectedPhoto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <div 
            className="relative max-w-6xl w-full max-h-[90vh] bg-gray-950 border border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row cursor-auto transform transition-transform duration-500 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={24} />
            </button>
            
            {/* Image Section */}
            <div className="w-full md:w-[70%] h-64 md:h-[90vh] bg-black flex items-center justify-center p-8">
              <img 
                src={selectedPhoto.storageUrl} 
                alt={selectedPhoto.title} 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Details Section */}
            <div className="w-full md:w-[30%] p-10 flex flex-col justify-center bg-gray-950 border-l border-gray-900">
              <h2 className="text-3xl font-light tracking-widest uppercase mb-4 text-white leading-tight">
                {selectedPhoto.title}
              </h2>
              <div className="w-12 h-px bg-white/20 mb-6"></div>
              <p className="text-gray-400 font-light mb-12 uppercase tracking-widest text-sm">
                by <span className="text-white">{selectedPhoto.userName}</span>
              </p>
              
              <Link 
                href={`/user/${selectedPhoto.userId}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-light tracking-widest uppercase text-xs hover:bg-white hover:text-black transition-all duration-300 w-full"
              >
                View Full Portfolio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
