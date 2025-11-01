"use client";

import { SwapIcon } from "@phosphor-icons/react";
import { IconAspectRatio, IconTerminal } from "@tabler/icons-react";
import { XCircle } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { useGenerateAppImage } from "@/src/hooks/useGenerateAppImage";
import { NodeParam } from "@/src/types/BaseType";
import { getIconForParam } from "@/src/utils/server/utils";

import AppGridClient from "./AppGridClient";
import { ImageObject } from "../inputBox/ReplicateParameters";
import AnimatedCounter from "../ui/AnimatedCounter";
import GenerateButton from "../ui/GenerateButton";
import GradualBlurMemo from "../ui/GradualBlur";
import ImageUploadBox from "../ui/ImageUploadBox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import VideoUploadBox from "../ui/VideoUploadBox";

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
  // const [inputImagePreview, setInputImagePreview] = useState<string | null>(null);
  const [mediaObjects, setMediaObjects] = useState<Record<string, ImageObject | null>>({});

  const { mutate, isPending, error: apiError } = useGenerateAppImage();

  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  const handleChange = useCallback(
    (description: string, newFieldValue: any, mediaObject?: ImageObject) => {
      setValues((currentParams) =>
        currentParams.map((param) =>
          param.description === description
            ? { ...param, fieldValue: String(newFieldValue) }
            : param,
        ),
      );

      if (mediaObject?.permanentPath) {
        setMediaObjects((prev) => ({ ...prev, [description]: mediaObject }));
      }
      console.log(values);
    },
    [],
  );

  const handleGenerateClick = () => {
    setFormError(null);

    const imageParam = values.find((p) => p.fieldName === "image");
    if (imageParam && !imageParam.fieldValue) {
      setFormError("Please upload an image for the image input.");
      return;
    }

    console.log("Generating with values:", values);
    console.log("Generating with input:", mediaObjects);

    // ✅ Convert media objects
    const inputMediaStoreUrls: string[] | null = (() => {
      const paths = Object.values(mediaObjects)
        .map((obj) => obj?.permanentPath)
        .filter((p): p is string => Boolean(p));
      return paths.length > 0 ? paths : null;
    })();

    const inputImagePreviewUrls: string[] | null = (() => {
      const urls = Object.values(mediaObjects)
        .map((obj) => obj?.displayUrl)
        .filter((u): u is string => Boolean(u));
      return urls.length > 0 ? urls : null;
    })();

    console.log("Input Media Store URLs:", inputMediaStoreUrls);
    console.log("Input Image Preview URLs:", inputImagePreviewUrls);

    // ✅ Call the mutation
    mutate({
      appId,
      parameters: values,
      inputMediaStoreUrls,
      inputImagePreviewUrls,
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
              <div className="size-full overflow-y-auto p-2">
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
                className="size-full rounded-3xl object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                className="size-full rounded-3xl object-cover transition-all duration-300 group-hover:brightness-90"
                src={appCover}
                alt={"app card small"}
                width={150}
                height={95}
              />
            )}

            <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="truncate font-satoshi text-sm font-medium text-accent">Quick Change</p>
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
                const key = param.description;

                if (param.fieldName === "image") {
                  return (
                    <div key={key}>
                      {/* Add key here */}
                      <ImageUploadBox
                        onImageUploaded={(image) => {
                          handleChange(key, image.displayUrl, image);
                        }}
                        onImageRemoved={() => {
                          handleChange(key, "");
                          setMediaObjects((prev) => ({ ...prev, [key]: null }));
                          sessionStorage.removeItem("initialEditImage");
                        }}
                        imageDescription={param.description}
                      />
                    </div>
                  );
                }

                if (param.fieldName === "video") {
                  return (
                    <div key={key}>
                      {/* Add key here */}
                      <VideoUploadBox
                        onVideoUploaded={(video) => {
                          handleChange(key, video.displayUrl, video);
                        }}
                        onVideoRemoved={() => {
                          handleChange(key, "");
                          setMediaObjects((prev) => ({ ...prev, [key]: null }));
                          sessionStorage.removeItem("initialEditImage");
                        }}
                        videoDescription={param.description}
                      />
                    </div>
                  );
                }

                if (
                  (param.fieldName === "aspect_ratio" ||
                    param.fieldName === "size" ||
                    param.fieldName === "select" ||
                    param.fieldName === "model_selected" ||
                    param.description === "aspect_ratio") &&
                  param.fieldData
                ) {
                  let options: string[] = [];
                  try {
                    options = JSON.parse(param.fieldData)[0];
                  } catch (e) {
                    console.error("Failed to parse fieldData:", e);
                  }
                  return (
                    <div key={param.nodeId} className="min-w-[130px]">
                      <Select
                        value={param.fieldValue}
                        onValueChange={(val) => handleChange(key, val)}
                      >
                        <SelectTrigger className="w-full">
                          {param.fieldName !== "aspect_ratio" &&
                            param.description !== "aspect_ratio" &&
                            getIconForParam(param.description ?? key)}
                          <SelectValue placeholder={param.description} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {options.map((opt) => {
                              const isAspect =
                                param.fieldName === "aspect_ratio" ||
                                param.description === "aspect_ratio";

                              // Detect ratio-like options (e.g. "16:9")
                              const ratioRegex = /^\d+:\d+$/;
                              const isRatio = ratioRegex.test(opt);

                              let preview = null;

                              if (isAspect) {
                                if (isRatio) {
                                  // Numeric aspect ratio visualization
                                  const [w, h] = opt.split(":").map(Number);
                                  const aspectRatio = w / h;
                                  const baseHeight = 15;
                                  const previewWidth = baseHeight * aspectRatio;

                                  preview = (
                                    <div
                                      className="flex-shrink-0 rounded-sm border border-gray-400 bg-muted"
                                      style={{
                                        width: `${previewWidth}px`,
                                        height: `${baseHeight}px`,
                                      }}
                                    />
                                  );
                                } else {
                                  // Non-ratio text options like "match_input_image" or "auto"
                                  preview = <IconAspectRatio size={15} />;
                                }
                              }

                              return (
                                <SelectItem key={opt} value={opt}>
                                  <div className="flex items-center gap-2">
                                    {preview}
                                    <span className="text-sm">{opt}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                if (param.description === "Portrait or landscape mode") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-sm font-semibold">{param.description}</span>
                      <div className="min-w-[130px]">
                        <Select
                          value={param.fieldValue}
                          onValueChange={(val) => handleChange(key, val)}
                        >
                          <SelectTrigger className="w-full">
                            {getIconForParam(param.description ?? key)}
                            <SelectValue placeholder={param.description} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={"1"}>Vertical</SelectItem>
                              <SelectItem value={"2"}>Landscape</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                }

                if (param.description === "Camera movement") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-sm font-semibold">{param.description}</span>
                      <div className="min-w-[130px]">
                        <Select
                          value={param.fieldValue}
                          onValueChange={(val) => handleChange(key, val)}
                        >
                          <SelectTrigger className="w-full">
                            {getIconForParam(param.description ?? key)}
                            <SelectValue placeholder={param.description} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={"1"}>None</SelectItem>
                              <SelectItem value={"2"}>Turn to front</SelectItem>
                              <SelectItem value={"3"}>Approach</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                }

                if (param.description === "Object gender") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-sm font-semibold">Gender</span>
                      <div className="min-w-[130px]">
                        <Select
                          value={param.fieldValue}
                          onValueChange={(val) => handleChange(key, val)}
                        >
                          <SelectTrigger className="w-full">
                            {getIconForParam(param.description ?? key)}
                            <SelectValue placeholder={param.description} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={"1"}>Women</SelectItem>
                              <SelectItem value={"2"}>Mam</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                }

                if (param.description === "POV interactive preset") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-sm font-semibold">
                        POV Interactive preset
                      </span>
                      <div className="min-w-[130px]">
                        <Select
                          value={param.fieldValue}
                          onValueChange={(val) => handleChange(key, val)}
                        >
                          <SelectTrigger className="w-full">
                            {getIconForParam(param.description ?? key)}
                            <SelectValue placeholder={param.description} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={"1"}>None</SelectItem>
                              <SelectItem value={"2"}>Click me</SelectItem>
                              <SelectItem value={"3"}>Help me warm my hands</SelectItem>
                              <SelectItem value={"4"}>I look at [your]</SelectItem>
                              <SelectItem value={"5"}>Palm painting heart</SelectItem>
                              <SelectItem value={"6"}>Apply band-aid</SelectItem>
                              <SelectItem value={"7"}>I send [item]</SelectItem>
                              <SelectItem value={"8"}>Kiss me</SelectItem>
                              <SelectItem value={"9"}>Look at me</SelectItem>
                              <SelectItem value={"10"}>Take off shoes</SelectItem>
                              <SelectItem value={"11"}>Take off stockings</SelectItem>
                              <SelectItem value={"12"}>Take off shoes and hit me</SelectItem>
                              <SelectItem value={"13"}>Make my hair</SelectItem>
                              <SelectItem value={"14"}>Feed [food]</SelectItem>
                              <SelectItem value={"15"}>Quiet</SelectItem>
                              <SelectItem value={"16"}>Comb hair</SelectItem>
                              <SelectItem value={"17"}>Stethoscope</SelectItem>
                              {/* <SelectItem value={"18"}>I touch you</SelectItem> */}
                              <SelectItem value={"19"}>Make a funny face</SelectItem>
                              <SelectItem value={"20"}>Snatch my glasses</SelectItem>
                              <SelectItem value={"21"}>Hold your hand</SelectItem>
                              <SelectItem value={"22"}>Send me [item]</SelectItem>
                              <SelectItem value={"23"}>Pinch cheeks</SelectItem>
                              <SelectItem value={"24"}>Combo punch me</SelectItem>
                              {/* <SelectItem value={"25"}>Kneel down</SelectItem> */}
                              <SelectItem value={"26"}>Sit down and cross your legs</SelectItem>
                              {/* <SelectItem value={"27"}>Sit down and cross your legs</SelectItem> */}
                              {/* <SelectItem value={"28"}>Sit down and cross your legs</SelectItem> */}
                              <SelectItem value={"29"}>Continuous shooting</SelectItem>
                              {/* <SelectItem value={"30"}></SelectItem> */}
                              <SelectItem value={"31"}>Stretching</SelectItem>
                              <SelectItem value={"32"}>Pick up things</SelectItem>
                              <SelectItem value={"33"}>Make your hair</SelectItem>
                              <SelectItem value={"34"}>Bow</SelectItem>
                              <SelectItem value={"35"}>Fall down</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                }

                if (param.fieldName === "int") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-xs font-semibold">{param.description}</span>
                      <div className="px-2">
                        <AnimatedCounter
                          initialValue={Number(param.fieldValue)}
                          // min={50}
                          // max={900}
                          // incrementStep={50}
                          onChange={handleChange}
                          paramKey={key!}
                        />
                      </div>
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
                          onCheckedChange={(value) => handleChange(key, value ? "true" : "false")}
                        />
                      </div>
                    </div>
                  );
                }

                if (param.fieldName === "prompt" || param.fieldName === "text") {
                  return (
                    <div key={key} className="flex h-full flex-col justify-between gap-2 py-2">
                      <span className="text-center text-xs font-semibold">{param.description}</span>
                      <Textarea
                        value={param.fieldValue as string}
                        onChange={(e) => handleChange(key, e.target.value)}
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
