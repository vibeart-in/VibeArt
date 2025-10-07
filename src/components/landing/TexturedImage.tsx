// components/TexturedImage.tsx

import React from "react";
interface TexturedImageProps {
  src: string;
  alt?: string;
  borderRadius?: string;
  baseFrequency?: number;
  numOctaves?: number;
  scale?: number;
  seed?: number;
  className?: string;
}

export const TexturedImage: React.FC<TexturedImageProps> = ({
  src,
  alt = "Textured Image",
  borderRadius = "0px",
  baseFrequency = 0.05,
  numOctaves = 2,
  scale = 6,
  seed = 1,
  className = "",
}) => {
  const filterId = React.useId();

  return (
    <div
      style={{
        overflow: "hidden",
        display: "inline-block",
      }}
      className={className}
    >
      {/* SVG filter definition */}
      <svg width="0" height="0">
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={numOctaves}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Image with filter */}
      <img
        src={src}
        alt={alt}
        style={{
          filter: `url(#${filterId})`,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius,
        }}
      />
    </div>
  );
};
