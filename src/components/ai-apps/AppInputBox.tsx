"use client";
import { useCallback, useState } from "react";

import { XCircle } from "lucide-react";

import Image from "next/image";
import { IconTerminal } from "@tabler/icons-react";
import { SwapIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { NodeParam } from "@/src/types/BaseType";

import { Textarea } from "../ui/textarea";
import GradualBlurMemo from "../ui/GradualBlur";
import GenerateButton from "../ui/GenerateButton";
import ImageUploadBox from "../ui/ImageUploadBox";
import AppGridClient from "./AppGridClient";
import { Switch } from "../ui/switch";
import { useGenerateAppImage } from "@/src/hooks/useGenerateAppImage";

const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: -6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.12, ease: "easeOut" },
      scale: { type: "spring", stiffness: 520, damping: 24, mass: 0.9 },
      y: { type: "spring", stiffness: 520, damping: 24, mass: 0.9 },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -6,
    transition: {
      opacity: { duration: 0.12, ease: "easeIn" },
      scale: { duration: 0.12, ease: "easeIn" },
      y: { duration: 0.12, ease: "easeIn" },
    },
  },
};

interface AppInputBoxProps {
  appId: string;
  appParameters: NodeParam[];
  appCost: number;
  appCover: string;
}

const AppInputBox = ({ appId, appParameters, appCost, appCover }: AppInputBoxProps) => {
  const [values, setValues] = useState<NodeParam[]>(appParameters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);

  const { mutate, isPending, error: apiError } = useGenerateAppImage();

  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  const handleChange = useCallback((nodeId: string, newFieldValue: any, previewUrl?: string) => {
    setValues((currentParams) =>
      currentParams.map((param) =>
        param.nodeId === nodeId ? { ...param, fieldValue: String(newFieldValue) } : param,
      ),
    );
    // If a preview URL was provided (meaning it was an image upload), store it
    if (previewUrl) {
      setInputImagePreview(previewUrl);
    }
  }, []);

  const handleGenerateClick = () => {
    setFormError(null);
    console.log(values);
    // Basic client-side validation based on common inputs
    const imageParam = values.find((p) => p.fieldName === "image");

    if (imageParam && !imageParam.fieldValue) {
      setFormError("Please upload an image for the image input.");
      return;
    }

    // Call the mutation
    mutate({
      appId: appId,
      parameters: values,
      inputImagePreviewUrl: inputImagePreview, // Pass the preview URL to the mutation
    });
  };

  const isVideo = appCover.endsWith(".mp4");

  return (
    <>
      <div className="relative mb-2 w-fit rounded-[28px] bg-[#111111]/80 p-2 backdrop-blur-md md:p-3">
        <AnimatePresence>
          {isDialogOpen && (
            <motion.div
              className="mb-2 w-full overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "28rem" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="h-full w-full overflow-y-auto p-2">
                <AppGridClient compact={true} />
              </div>
              <GradualBlurMemo
                target="parent"
                position="bottom"
                height="12rem"
                strength={2}
                divCount={5}
                zIndex={1}
                className="!bottom-2 p-2"
                curve="bezier"
                exponential={true}
                opacity={1}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <section className="flex gap-4">
          <div
            onClick={handleCardClick}
            className="group relative z-20 h-[95px] w-[120px] flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl transition-transform hover:scale-105 active:scale-100"
          >
            {/* Inner shadow */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>
            {isVideo ? (
              <video
                src={appCover}
                className="h-full w-full rounded-3xl object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                className="h-full w-full rounded-3xl object-cover transition-all duration-300 group-hover:brightness-90"
                src={appCover}
                alt={"app card small"}
                width={150}
                height={95}
              />
            )}

            <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="font-satoshi truncate text-sm font-medium text-accent">Quick Change</p>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
                <SwapIcon size={30} weight="bold" />
              </span>
            </div>
          </div>

          <div className="z-20 flex flex-col items-center gap-2">
            <div className="flex h-full items-start gap-2">
              {values.map((param) => {
                const key = param.nodeId;

                if (param.fieldName === "image") {
                  return (
                    <div key={key}>
                      {" "}
                      {/* Add key here */}
                      <ImageUploadBox
                        onImageUploaded={({ permanentPath, displayUrl }) => {
                          handleChange(param.nodeId, permanentPath, displayUrl);
                        }}
                        onImageRemoved={() => {
                          handleChange(param.nodeId, "");
                          sessionStorage.removeItem("initialEditImage");
                        }}
                        imageDescription={param.description}
                      />
                    </div>
                  );
                }

                if (param.fieldName === "boolean") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-xs font-semibold">{param.description}</span>
                      <div className="px-2">
                        <Switch
                          checked={param.fieldValue === "true"}
                          onCheckedChange={(value) =>
                            handleChange(param.nodeId, value ? "true" : "false")
                          }
                        />
                      </div>
                    </div>
                  );
                }

                if (param.fieldName === "prompt" || param.fieldName === "text") {
                  return (
                    <div key={key} className="flex h-full w-full items-center justify-center">
                      {" "}
                      {/* Add key here */}
                      <IconTerminal className="absolute left-4 top-2 text-white/80" />
                      <Textarea
                        value={param.fieldValue as string}
                        onChange={(e) => handleChange(param.nodeId, e.target.value)}
                        className="hide-scrollbar max-h-full min-w-[200px] border pl-4"
                        maxHeight={100}
                        placeholder={param.description}
                      />
                    </div>
                  );
                }
                return null; // Return null for unhandled parameter types
              })}
            </div>
          </div>
          <GenerateButton
            handleGenerateClick={handleGenerateClick}
            isPending={isPending}
            cost={appCost}
          />
        </section>
      </div>
      <AnimatePresence mode="popLayout">
        {formError && (
          <motion.div
            key="form-error"
            variants={popVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-2 flex items-center gap-2 rounded-xl bg-red-900/70 p-2 text-sm text-red-400"
            role="alert"
          >
            <XCircle
              size={16}
              className="cursor-pointer hover:text-red-300"
              onClick={() => setFormError(null)}
            />
            <p>{formError}</p>
          </motion.div>
        )}
        {/* Display API error */}
        {apiError && (
          <motion.div
            key="api-error"
            variants={popVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-2 flex items-center gap-2 rounded-xl bg-red-900/70 p-2 text-sm text-red-400"
            role="alert"
          >
            <XCircle
              size={16}
              className="cursor-pointer hover:text-red-300"
              onClick={() => {
                /* Consider how to clear this error if needed */
              }}
            />
            <p>{apiError.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppInputBox;
