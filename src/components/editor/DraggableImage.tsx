import React, { useRef, useEffect } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

interface DraggableImageProps {
  id: string;
  imageSrc: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  // Initial props
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export default function DraggableImage({
  id,
  imageSrc,
  isSelected,
  onSelect,
  onChange,
  x = 0,
  y = 0,
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
}: DraggableImageProps) {
  const [image] = useImage(imageSrc, "anonymous");
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Update parent with image dimensions once loaded
  useEffect(() => {
    if (image) {
      onChange({
        width: image.width,
        height: image.height,
      });
    }
  }, [image]);

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={image}
        name={`image-${id}`}
        draggable
        x={x}
        y={y}
        rotation={rotation}
        scaleX={scaleX}
        scaleY={scaleY}
        // Center the origin for easier rotation/scaling
        offsetX={image ? image.width / 2 : 0}
        offsetY={image ? image.height / 2 : 0}
        onDragEnd={(e) => {
          onChange({
            ...e.target.attrs,
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale and rotation and absolutePosition
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...node.attrs,
            x: node.x(),
            y: node.y(),
            // set minimal value
            scaleX: scaleX,
            scaleY: scaleY,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
