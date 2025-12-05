import React, { useRef, useEffect, useState } from "react";
import { Image as KonvaImage, Group, Rect, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

interface DraggableImageProps {
  id: string;
  imageSrc: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  onDragEnd: () => void;
  onTransformEnd: () => void;
}

const DraggableImage = ({
  id,
  imageSrc,
  x,
  y,
  width,
  height,
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
  isSelected,
  onSelect,
  onChange,
  onDragEnd,
  onTransformEnd,
}: DraggableImageProps) => {
  const [image] = useImage(imageSrc, 'anonymous');
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        scaleX={scaleX}
        scaleY={scaleY}
        draggable
        name={`image-${id}`}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
          onDragEnd();
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;
          
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          // reset scale to 1 to avoid weird scaling issues if we save it
          // node.scaleX(1);
          // node.scaleY(1);
          
          onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
          });
          onTransformEnd();
        }}
        // Add a shadow or border effect when selected or hovered could be nice
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.3}
        shadowOffsetX={5}
        shadowOffsetY={5}
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
    </React.Fragment>
  );
};

export default DraggableImage;
