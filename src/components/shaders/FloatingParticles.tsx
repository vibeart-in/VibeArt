"use client";

import React, { useEffect, useState } from "react";

export const FloatingParticles = ({ count = 100 }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generatedParticles = Array.from({ length: count }).map((_, index) => {
      const random = (max: number, min: number = 0): number =>
        Math.random() * (max - min) + min;

      const startY = -random(20, 10);
      const endY = random(20) + 100;
      const startX = random(100);
      const endX = random(100);
      const duration = random(57000, 50000);
      const innerDuration = 5000;

      return {
        id: index,
        size: random(6, 2),
        "--from-x": `${startX}vw`,
        "--from-y": `${startY}vh`,
        "--to-x": `${endX}vw`,
        "--to-y": `${endY}vh`,
        animationDuration: `${duration}ms`,
        animationDelay: `-${random(duration)}ms`,
        innerAnimationDelay: `-${random(innerDuration)}ms`,
      };
    });

    setParticles(generatedParticles);
  }, [count]);

  // Render nothing during SSR
  if (particles.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 left-0"
          style={
            {
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `move-particle linear infinite`,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              "--from-x": p["--from-x"],
              "--from-y": p["--from-y"],
              "--to-x": p["--to-x"],
              "--to-y": p["--to-y"],
            } as React.CSSProperties
          }
        >
          <div
            className="w-full h-full rounded-full mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(hsl(180, 100%, 40%), hsl(180, 100%, 40%) 10%, hsla(180, 100%, 80%, 0) 46%)",
              animation: "fade-and-scale 2s infinite",
              animationDelay: p.innerAnimationDelay,
            }}
          />
        </div>
      ))}
    </div>
  );
};
