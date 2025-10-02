"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { XCircle } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { ConversationType, ModelData, NodeParam } from "@/src/types/BaseType";
import GradualBlurMemo from "../ui/GradualBlur";
import GenerateButton from "../ui/GenerateButton";
import { usePathname } from "next/navigation";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import DialogBox from "../inputBox/DialogBox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import AnimatedCounter from "../ui/AnimatedCounter";
import { IconTerminal } from "@tabler/icons-react";
import { Textarea } from "../ui/textarea";
import ImageUploadBox from "../ui/ImageUploadBox";

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
  conversationId?: string;
}

const AppInputBox = ({ appParameters }: { appParameters: NodeParam[] }) => {
  const [values, setValues] = useState<NodeParam[]>(appParameters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pathname = usePathname();
  const conversationType = pathname.split("/")[2] as ConversationType;

  const handleModelSelect = (model: ModelData) => {
    sessionStorage.setItem("lastSelectedModel", JSON.stringify(model));
    setIsDialogOpen(false);
  };

  const handleCardClick = () => {
    setIsDialogOpen((prev) => !prev);
  };

  const handleUpload = (url: string) => {
    console.log("Upload complete! Signed URL:", url);
    // setSingleImageUrl(url);
    // Update the form values as well
    const key = "image";
    handleChange(key, url);
  };


  const handleChange = useCallback(
    (description: string, newFieldValue: any) => {
      setValues((currentParams) =>
        currentParams.map((param) =>
          param.description === description
            ? { ...param, fieldValue: String(newFieldValue) }
            : param
        )
      );
    },
    []
  );

  return (
    <>
      <div className="relative w-fit bg-[#111111]/80 backdrop-blur-md rounded-[28px] p-2 md:p-3 mb-2">
        <AnimatePresence>
          {isDialogOpen && (
            <motion.div
              className=" w-full mb-2 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "24rem" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="w-full h-full p-2 overflow-y-auto">
                <DialogBox
                  conversationType={conversationType}
                  onSelectModel={handleModelSelect}
                />
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

            {/* Image */}
            <Image
              className="object-cover w-full h-full rounded-3xl transition-all duration-300 group-hover:brightness-90"
              src={
                "https://rh-images.xiaoyaoyou.com/de341d98bcc516a1e9639e4abeb44e9f/output/Video-wan2.2-kj_00001_p80_ldhpu_1759233070.gif?imageMogr2/format/webp/ignore-error/1"
              }
              alt={"app card small"}
              width={150}
              height={95}
            />

            {/* Model name (now fades out on hover) */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/30 rounded-md p-1 text-center transition-opacity group-hover:opacity-0">
              <p className="text-accent font-gothic text-sm font-medium truncate">
                Change
              </p>
            </div>

            {/* Hover-only "Click to change" hint (fades in on hover) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white/90 bg-black/50 px-2 py-1 rounded-xl">
                <PencilSimpleIcon size={20} weight="fill" />
              </span>
            </div>
          </div>

          <div className="flex z-20 flex-col items-center gap-2">
            {/* DESKTOP: Show parameters inline */}
            <div className="flex gap-2 items-center">
              {appParameters.map((param) => {
                const key = param.nodeId;

                if (param.fieldName === "image") {
                  return <ImageUploadBox onUploadComplete={handleUpload} />;
                }

                if (
                  (param.fieldName === "aspect_ratio" ||
                    param.fieldName === "size") &&
                  param.fieldData
                ) {
                  let options: string[] = [];
                  try {
                    options = JSON.parse(param.fieldData)[0];
                  } catch (e) {
                    console.error(
                      "Failed to parse fieldData for aspect_ratio:",
                      e
                    );
                  }
                  return (
                    <div key={key} className="min-w-[130px]">
                      <Select
                        value={param.fieldValue}
                        onValueChange={(val) =>
                          handleChange(param.description!, val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={param.description} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // COUNTER for integer/numeric values
                if (param.description === "batch_size") {
                  return (
                    <div key={key}>
                      <label className="text-xs text-white/70 block mb-1">
                        {param.description}
                      </label>
                      <AnimatedCounter
                        initialValue={Number(param.fieldValue)}
                        min={param.description === "batch_size" ? 1 : 0}
                        max={param.description === "batch_size" ? 8 : 2}
                        onChange={(val) =>
                          handleChange(param.description!, val)
                        }
                      />
                    </div>
                  );
                }

                if (param.fieldName === "prompt") {
                  return (
                    <div key={key} className="w-full relative">
                      <IconTerminal className="absolute top-2 left-4 text-white/80" />
                      <Textarea
                        value={param.fieldValue as string}
                        onChange={(e) =>
                          handleChange(param.description!, e.target.value)
                        }
                        className="pl-12 hide-scrollbar min-w-[400px]"
                        maxHeight={80}
                        placeholder="Negative Prompt..."
                      />
                    </div>
                  );
                }
              })}
            </div>
          </div>
          {/* <GenerateButton
            handleGenerateClick={() => {}}
            mutation={mutation}
            selectedModel={{ cost: 5 }}
          /> */}
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
      </AnimatePresence>
    </>
  );
};

export default AppInputBox;
