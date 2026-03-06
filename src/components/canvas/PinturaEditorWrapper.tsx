import "@pqina/pintura/pintura.css";
import { getEditorDefaults } from "@pqina/pintura";
import { PinturaEditor } from "@pqina/react-pintura";
import { Download, Save, Loader2, X } from "lucide-react";
import React, { useRef, useState } from "react";
import pintura from "@pqina/pintura/pintura.module.css";
import styles from "@/src/app/index.module.css";
const pinturaTheme = styles.index;

interface PinturaEditorWrapperProps {
  src: string;
  onSaveCanvas: (blob: Blob) => Promise<void>;
  onClose: () => void;
}

export default function PinturaEditorWrapper({
  src,
  onSaveCanvas,
  onClose,
}: PinturaEditorWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const editorRef = useRef<any>(null);

  const editorConfig = getEditorDefaults({
    // Hide default export/close if we want to provide our own, but let's keep them and just use our own buttons for explicit actions
    enableButtonExport: false,
    enableButtonClose: false,
  });

  const handleSaveToCanvas = async () => {
    if (!editorRef.current) return;
    try {
      setIsProcessing(true);
      const res = await editorRef.current.editor.processImage();
      await onSaveCanvas(res.dest);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!editorRef.current) return;
    try {
      setIsProcessing(true);
      const res = await editorRef.current.editor.processImage();
      const url = URL.createObjectURL(res.dest);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex size-full flex-col bg-[#111111]">
      {/* Custom Top Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <h2 className="text-sm font-semibold text-white">Advanced Edit</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handleSaveToCanvas}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save to Canvas
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="ml-2 flex size-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Pintura Editor Container */}
      <div className="relative flex-1">
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-accent" />
            <p className="text-sm font-medium text-white">Processing image...</p>
          </div>
        )}
        <PinturaEditor
          ref={editorRef}
          {...editorConfig}
          src={src}
          className={`${pintura} ${pinturaTheme} size-full`}
          // className="pintura-theme-dark size-full"
        />
      </div>
    </div>
  );
}
