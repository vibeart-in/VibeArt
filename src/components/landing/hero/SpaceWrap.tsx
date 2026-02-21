import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SETTINGS = {
  backgroundColor: "#020603", // Pure black
  starColor: "183, 211, 211", // White stars (RGB format)
  starCount: 1000, // Number of stars
  scrollLength: 3000, // How many pixels of scroll the animation lasts
  minSpeed: 2, // Idle speed of stars
  maxSpeed: 80, // Speed when scrolling fast (Warp speed)
  starFade: 0.15, // Trail length (Lower = longer trails, Higher = shorter dots)
};

const ClarityScroll: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const contentTextRef = useRef<HTMLDivElement>(null);

  // Animation Refs
  const warpSpeedRef = useRef(0);
  const starsRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- 1. SETUP STARFIELD ---
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const focalLength = canvas.width * 2;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    // Initialize Stars
    starsRef.current = [];
    for (let i = 0; i < SETTINGS.starCount; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        o: 0.1 + Math.random() * 0.9,
        trail: [], // Stores previous positions for the trail effect
      });
    }

    // --- 2. RENDER LOOP ---
    const render = () => {
      if (canvas.width !== window.innerWidth) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
      }

      // CLEAR CANVAS
      // We use a semi-transparent fill to create trails.
      // The lower the alpha, the longer the trails linger.
      // We calculate alpha based on settings and current speed.
      const clearAlpha = Math.max(SETTINGS.starFade, 1 - warpSpeedRef.current);

      // Convert Hex/String color to RGBA for the fading trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${clearAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Stars
      for (let i = 0; i < starsRef.current.length; i++) {
        const star = starsRef.current[i];

        // Z Movement (Speed Control)
        // Current Speed = Minimum + (ScrollIntensity * MaxSpeed)
        const currentSpeed = SETTINGS.minSpeed + warpSpeedRef.current * SETTINGS.maxSpeed;
        star.z -= currentSpeed;

        // Reset Star if it passes camera
        if (star.z < 1) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.trail = [];
        }

        // Projection logic (3D to 2D)
        const px = (star.x - centerX) * (focalLength / star.z) + centerX;
        const py = (star.y - centerY) * (focalLength / star.z) + centerY;

        // Add Trail
        star.trail.push({ x: px, y: py });

        // Limit trail length based on speed (go faster = longer trails)
        const trailLimit = 2 + warpSpeedRef.current * 20;
        if (star.trail.length > trailLimit) star.trail.shift();

        // Render Trail
        if (star.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);
          for (let j = 1; j < star.trail.length; j++) {
            ctx.lineTo(star.trail[j].x, star.trail[j].y);
          }
          // Trail Color
          ctx.strokeStyle = `rgba(${SETTINGS.starColor}, ${star.o})`;
          ctx.lineWidth = 0.5 + warpSpeedRef.current * 1.5;
          ctx.stroke();
        }
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();

    // --- 3. GSAP SCROLL LOGIC ---
    const ctxGsap = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: `+=${SETTINGS.scrollLength}`,
          pin: true,
          scrub: 0.5, // Adds a little 'weight' to the scroll interaction
          onUpdate: (self) => {
            // Update warp speed based on scroll progress
            const p = self.progress;
            // Ramp speed up and down based on scroll position
            // Slower ramp up (0.25) to prevent it from getting too fast with little scrolling
            if (p < 0.25) warpSpeedRef.current = p * 4;
            else if (p > 0.75) warpSpeedRef.current = (1 - p) * 4;
            else warpSpeedRef.current = 1;
          },
        },
      });

      // TIMELINE ANIMATIONS

      // 1. Enter
      tl.to(textRef.current, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.1,
        ease: "power2.out",
      })

        // 2. Hold (The text stays while stars fly)
        .to(textRef.current, {
          opacity: 1,
          duration: 0.8,
        })

        // 3. Exit
        .to(textRef.current, {
          opacity: 0,
          scale: 1.1,
          filter: "blur(10px)",
          duration: 0.1,
          ease: "power2.in",
        });

      // Next Section Animation
      gsap.fromTo(
        contentTextRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentSectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, sceneRef);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
      ctxGsap.revert();
    };
  }, []);

  return (
    <>
      <style>{`
        @import url("https://fonts.cdnfonts.com/css/thegoodmonolith");
        @font-face {
          font-family: "PP Neue Montreal";
          src: url("https://fonts.cdnfonts.com/s/64587/PPNeueMontreal-Medium.woff2") format("woff2");
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
        
        // body { margin: 0; background-color: ${SETTINGS.backgroundColor}; overflow-x: hidden; }
        
        .dust-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            /* 
               IMPERFECTIONS:
               We use an image with mix-blend-mode: screen.
               On a black background, the black parts of the image become transparent,
               leaving only the white scratches/dust visible.
            */
            background-image: url("https://i.pinimg.com/736x/a3/5b/3d/a35b3df2f45641525e5d15e4f8d7f918.jpg");
            opacity: 0.2; /* Adjust visibility of scratches here */
            pointer-events: none; 
            z-index: 50; 
            mix-blend-mode: screen; 
            filter: contrast(120%) brightness(120%);
        }
      `}</style>

      <div
        className="clarity-container"
        style={{ fontFamily: '"TheGoodMonolith", sans-serif', color: "#fff", position: "relative" }}
      >
        <div className="dust-overlay"></div>

        <div
          ref={sceneRef}
          style={{
            height: "100vh",
            width: "100%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: SETTINGS.backgroundColor,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          />

          <div
            ref={textRef}
            style={{
              position: "relative",
              zIndex: 10,
              textAlign: "center",
              fontFamily: '"PP Neue Montreal", sans-serif',
              fontSize: "clamp(3rem, 6vw, 5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "#ffffff",
              opacity: 0,
              transform: "scale(0.9)",
              filter: "blur(10px)",
              pointerEvents: "none",
              willChange: "opacity, transform, filter",
            }}
          >
            CLARITY
            <br />
            THROUGH
            <br />
            SIMPLICITY
          </div>
        </div>

        <div
          ref={contentSectionRef}
          style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            backgroundColor: SETTINGS.backgroundColor,
            position: "relative",
            zIndex: 20,
          }}
        >
          <div ref={contentTextRef} style={{ maxWidth: "800px", textAlign: "center", opacity: 0 }}>
            <h2
              style={{
                fontFamily: '"PP Neue Montreal", sans-serif',
                fontSize: "2rem",
                textTransform: "uppercase",
                marginBottom: "2rem",
                fontWeight: "normal",
              }}
            >
              The Art of Reduction
            </h2>
            <p
              style={{ marginBottom: "1.5rem", opacity: 0.8, lineHeight: 1.6, fontSize: "1.1rem" }}
            >
              In a world of constant noise and distraction, true creativity emerges from the space
              between thoughts.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClarityScroll;
