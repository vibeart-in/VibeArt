import { useCallback, useRef, DragEvent } from "react";
import { uploadImage } from "@/src/utils/server/UploadImage";

interface UseFileUploadOptions {
  onFileProcessed: (file: File, imageUrl: string) => void;
  onFileUploaded: (nodeId: string, permanentPath: string, displayUrl: string) => void;
}

export function useFileUpload({
  onFileProcessed,
  onFileUploaded,
}: UseFileUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingNodes = useRef<Map<string, File>>(new Map());

  // ============================================================================
  // File Processing
  // ============================================================================

  const processFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const tempNodeId = `temp-${Date.now()}`;
      
      // Store the file for this node
      processingNodes.current.set(tempNodeId, file);
      
      // Create node with temporary URL
      onFileProcessed(file, imageUrl);

      try {
        const { permanentPath, displayUrl } = await uploadImage({ file });
        
        // Update node with permanent URL
        onFileUploaded(tempNodeId, permanentPath, displayUrl);
        
        // Clean up
        processingNodes.current.delete(tempNodeId);
      } catch (err) {
        console.error("Upload failed", err);
        processingNodes.current.delete(tempNodeId);
      }
    };
    
    reader.readAsDataURL(file);
  }, [onFileProcessed, onFileUploaded]);

  // ============================================================================
  // Drag and Drop Handlers
  // ============================================================================

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          processFile(file);
        }
      });
    }
  }, [processFile]);

  // ============================================================================
  // Upload Button Handlers
  // ============================================================================

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          processFile(file);
        }
      });
    }
  }, [processFile]);

  return {
    fileInputRef,
    onDragOver,
    onDrop,
    handleUploadClick,
    handleFileChange,
  };
}
