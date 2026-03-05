"use client";

import { CurrencyCircleDollar } from "@phosphor-icons/react";
import { useNodesData, NodeToolbar, Position, useReactFlow } from "@xyflow/react"; // Remember to import Position
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import { useAtom } from "jotai";
import { Sparkles, ChevronDown, Palette, Download } from "lucide-react";
import { useEffect, useState } from "react";

import { getProducts } from "@/src/actions/subscription/getProducts";
import { getUserSubscription } from "@/src/actions/subscription/getUserSubscriptionFull";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useModelsByUsecase } from "@/src/hooks/useModelsByUsecase";
import { useNavInfo } from "@/src/hooks/useNavInfo";
import { selectedModelAtom } from "@/src/store/nodeAtoms";
import { ConversationType } from "@/src/types/BaseType";
import { Database } from "@/supabase/database.types";

import UpdatePlanDialog from "../../user/dashboard/updatePlanDialog";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface GenerateToolbarProps {
  id?: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  initialModel?: string;
}

const STYLE_PROMPTS = [
  { label: "None", value: "none", image: "" },
  {
    label: "Cinematic",
    value: "cinematic style, highly detailed, dramatic lighting, 8k",
    image: "https://images.unsplash.com/photo-1572372421973-dcbd21d537be?w=300&h=300&fit=crop",
  },
  {
    label: "Anime",
    value: "anime style, 2d, studio ghibli, vibrant colors, masterpiece",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop",
  },
  {
    label: "Cyberpunk",
    value: "cyberpunk style, neon lights, futuristic, highly detailed",
    image: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=300&h=300&fit=crop",
  },
  {
    label: "Oil Painting",
    value: "oil painting style, thick brush strokes, classic art",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop",
  },
  {
    label: "Studio Ghibli",
    value:
      "A beautiful Studio Ghibli inspired illustration, soft watercolor textures, dreamy atmosphere, warm sunlight, lush natural environment, whimsical storytelling vibe, hand painted anime style, delicate linework, magical realism, peaceful and nostalgic mood",
    image: "https://images.unsplash.com/photo-1631582053308-40f482e7ace5?w=300&h=300&fit=crop",
  },
  {
    label: "Disney",
    value:
      "A highly detailed Pixar-style 3D animated character, expressive eyes, soft cinematic lighting, vibrant colors, smooth skin shading, playful personality, shallow depth of field, rendered like a frame from a modern Disney/Pixar animated film, ultra detailed, global illumination, cinematic composition",
    image: "https://images.unsplash.com/photo-1663250422296-ed759f42d5e1?w=300&h=300&fit=crop",
  },
  {
    label: "Ultra realistic",
    value:
      "Ultra realistic cinematic photograph, shot on ARRI Alexa cinema camera, natural skin texture, dramatic lighting, shallow depth of field, volumetric light, film grain, high dynamic range, 85mm lens, professional movie still",
    image: "https://images.unsplash.com/photo-1772442198677-10c8e7b46a5f?w=300&h=300&fit=crop",
  },
  {
    label: "Watercolor",
    value: "watercolor painting, soft edges, pastel colors",
    image: "https://images.unsplash.com/photo-1580136608260-4eb11f4b24fe?w=300&h=300&fit=crop",
  },
  {
    label: "3D Render",
    value: "3D render, unreal engine 5, octane render, beautiful lighting",
    image: "https://images.unsplash.com/photo-1637666505754-7416ebd70cbf?w=300&h=300&fit=crop",
  },
  {
    label: "Vintage",
    value: "vintage photo, polaroid, film grain, nostalgic",
    image: "https://images.unsplash.com/photo-1511407401960-0ee203836665?w=300&h=300&fit=crop",
  },
];

export default function GenerateToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  initialModel,
}: GenerateToolbarProps) {
  const nodesData = useNodesData(id || "");
  const { updateNodeData } = useReactFlow();

  // Check if input images are connected
  const hasInputImages = (nodesData?.data as any)?.inputImageUrls?.length > 0;

  const usecase =
    nodesData?.type === "outputImageAdvanced"
      ? ConversationType.ADVANCE
      : nodesData?.type === "generateVideo"
        ? ConversationType.VIDEO
        : hasInputImages
          ? ConversationType.EDIT
          : ConversationType.GENERATE;

  const { data: models = [] } = useModelsByUsecase(usecase);

  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom(id || ""));

  const { data: navData } = useNavInfo();
  const isFreeUser = navData?.navInfo?.subscription_tier === "free";
  const [isUpdatePlanOpen, setIsUpdatePlanOpen] = useState(false);
  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [userSubscription, setUserSubscription] = useState<{
    subscription: Subscription | null;
    user: any;
  } | null>(null);

  useEffect(() => {
    if (isFreeUser) {
      const fetchData = async () => {
        const [productsRes, subRes] = await Promise.all([getProducts(), getUserSubscription()]);
        if (productsRes.success && productsRes.data) setProducts(productsRes.data);
        if (subRes.success && subRes.data) setUserSubscription(subRes.data);
      };
      fetchData();
    }
  }, [isFreeUser]);

  const imageUrl = (nodesData?.data as any)?.imageUrl;

  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      const storedModelName = localStorage.getItem("lastSelectedModel");
      if (storedModelName) {
        const storedModel = models.find((m) => m.model_name === storedModelName);
        if (storedModel) {
          setSelectedModel(storedModel);
          return;
        }
      }
      if (initialModel) {
        const found = models.find((m) => m.model_name === initialModel);
        if (found) {
          setSelectedModel(found);
          return;
        }
      }
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel, setSelectedModel, initialModel]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const extension = blob.type.split("/")[1] || "png";
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const isActive = selected || isHovered;

  return (
    <NodeToolbar
      isVisible={true} // Hardcode to true, parent component manages unmounting logic now
      position={Position.Bottom}
      offset={12}
    >
      <div
        className={`ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex origin-top items-center gap-1.5 rounded-3xl border border-white/10 bg-[#131313] p-1.5 shadow-2xl transition-all duration-200 ${
          isActive
            ? `translate-y-0 scale-100 ${selected ? "opacity-100" : "opacity-80 hover:opacity-100"}`
            : "pointer-events-none -translate-y-4 scale-90 opacity-0"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Palette Section */}
        <Select
          value={(nodesData?.data as any)?.stylePrompt || "none"}
          onValueChange={(val) => {
            if (id) {
              updateNodeData(id, { stylePrompt: val === "none" ? "" : val });
            }
          }}
        >
          <SelectTrigger className="flex h-11 items-center gap-2.5 rounded-2xl border-0 bg-[#020202] pl-1.5 pr-4 text-base font-medium text-white transition-colors hover:bg-white/5 focus:ring-0">
            <SelectValue placeholder="Style" />
            <ChevronDown className="size-4 text-white opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_PROMPTS.map((style) => (
              <SelectItem key={style.label} value={style.value}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-[#1A1A1A] bg-cover bg-center"
                    style={style.image ? { backgroundImage: `url('${style.image}')` } : {}}
                  >
                    {!style.image && <Palette className="size-4 text-gray-400" />}
                  </div>
                  <span className="text-sm">{style.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Model Section */}
        <Select
          value={selectedModel?.model_name || ""}
          onValueChange={(val) => {
            const found = models?.find((m) => m.model_name === val);
            if (found) {
              if (isFreeUser && found.is_paid) {
                setIsUpdatePlanOpen(true);
                return;
              }
              setSelectedModel(found);
              localStorage.setItem("lastSelectedModel", found.model_name);
            }
          }}
        >
          <SelectTrigger className="flex h-11 items-center gap-2.5 rounded-2xl border-0 bg-[#020202] pl-1.5 pr-4 text-base font-medium text-white transition-colors hover:bg-[#020202]/30 focus:ring-0">
            <SelectValue placeholder="Select model" />
            <ChevronDown className="size-4 text-white opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.id} value={model.model_name}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="size-8 overflow-hidden rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${model.cover_image}')`,
                    }}
                  ></div>
                  <span className="text-base">{model.model_name}</span>
                  {isFreeUser && model.is_paid && (
                    <CurrencyCircleDollar
                      size={16}
                      weight="fill"
                      className="ml-auto text-yellow-400"
                    />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Section */}
        {/* <button className="flex size-11 items-center justify-center rounded-2xl bg-[#020202] text-gray-300 transition-colors hover:bg-[#020202]/30 hover:text-white">
          <Sparkles className="size-5 text-white hover:text-accent" />
        </button> */}

        {/* Download Button */}
        {imageUrl && (
          <button
            onClick={handleDownload}
            className="group flex size-11 items-center justify-center rounded-2xl bg-[#020202] text-gray-300 transition-colors hover:bg-[#020202]/30"
            title="Download Generated Image"
          >
            <Download className="size-5 text-white group-hover:text-accent" />
          </button>
        )}
      </div>

      {/* Access Restriction Dialog */}
      <UpdatePlanDialog
        isDialog={true}
        className="mx-0 transition-all duration-200"
        currentPlan={userSubscription?.subscription ?? null}
        onPlanChange={async () => {
          window.location.href = `/pricing`;
        }}
        triggerText=""
        products={products}
        user={navData?.user ?? null}
        openControlled={isUpdatePlanOpen}
        onOpenChangeControlled={setIsUpdatePlanOpen}
        hideTrigger={true}
      />
    </NodeToolbar>
  );
}
