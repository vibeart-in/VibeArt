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

const AppInputBox = ({
  appId,
  appParameters,
  appCost,
  appCover,
}: AppInputBoxProps) => {
  const [values, setValues] = useState<NodeParam[]>(appParameters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string | null>(
    null
  );

  const { mutate, isPending, error: apiError } = useGenerateAppImage();

  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  const handleChange = useCallback(
    (nodeId: string, newFieldValue: any, previewUrl?: string) => {
      setValues((currentParams) =>
        currentParams.map((param) =>
          param.nodeId === nodeId
            ? { ...param, fieldValue: String(newFieldValue) }
            : param
        )
      );
      // If a preview URL was provided (meaning it was an image upload), store it
      if (previewUrl) {
        setInputImagePreview(previewUrl);
      }
    },
    []
  );

  const handleGenerateClick = () => {
    setFormError(null); // Clear any previous form errors
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
      <div className="relative w-fit bg-[#111111]/80 backdrop-blur-md rounded-[28px] p-2 md:p-3 mb-2">
        <AnimatePresence>
          {isDialogOpen && (
            <motion.div
              className=" w-full mb-2 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "28rem" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="w-full h-full p-2 overflow-y-auto">
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
            className="w-[120px] h-[95px] z-20 rounded-3xl relative cursor-pointer transition-transform hover:scale-105 active:scale-100 overflow-hidden flex-shrink-0 group"
          >
            {/* Inner shadow */}
            <div className="absolute inset-0 shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)] rounded-3xl pointer-events-none"></div>
            {isVideo ? (
              <video
                src={appCover}
                className="object-cover w-full h-full rounded-3xl"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                className="object-cover w-full h-full rounded-3xl transition-all duration-300 group-hover:brightness-90"
                src={appCover}
                alt={"app card small"}
                width={150}
                height={95}
              />
            )}

            <div className="absolute bottom-2 left-2 right-2 bg-black/30 rounded-md p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="text-accent font-gothic text-sm font-medium truncate">
                Quick Change
              </p>
            </div>
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white/90 bg-black/50 px-2 py-1 rounded-xl">
                <SwapIcon size={30} weight="bold" />
              </span>
            </div>
          </div>

          <div className="flex z-20 flex-col items-center gap-2">
            <div className="flex gap-2 h-full items-start">
              {values.map((param) => {
                const key = param.nodeId;

                if (param.fieldName === "image") {
                  return (
                    <div key={key}>
                      {" "}
                      {/* Add key here */}
                      <ImageUploadBox
                        onUploadComplete={(permanentPath, displayUrl) => {
                          handleChange(param.nodeId, permanentPath, displayUrl);
                        }}
                        showImage={true}
                        imageDescription={param.description}
                      />
                    </div>
                  );
                }

                if (param.fieldName === "boolean") {
                  return (
                    <div
                      key={key}
                      className="flex flex-col h-full  justify-between gap-2 py-2"
                    >
                      <span className="text-xs font-semibold text-center">
                        {param.description}
                      </span>
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

                if (
                  param.fieldName === "prompt" ||
                  param.fieldName === "text"
                ) {
                  return (
                    <div
                      key={key}
                      className="w-full h-full flex justify-center items-center"
                    >
                      {" "}
                      {/* Add key here */}
                      <IconTerminal className="absolute top-2 left-4 text-white/80" />
                      <Textarea
                        value={param.fieldValue as string}
                        onChange={(e) =>
                          handleChange(param.nodeId, e.target.value)
                        }
                        className="pl-4 hide-scrollbar max-h-full min-w-[200px] border"
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
            className="flex items-center gap-2 text-red-400 bg-red-900/70 p-2 rounded-xl mb-2 text-sm"
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
            className="flex items-center gap-2 text-red-400 bg-red-900/70 p-2 rounded-xl mb-2 text-sm"
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
