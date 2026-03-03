"use client";

import { CurrencyCircleDollar } from "@phosphor-icons/react";
import { useNodesData, NodeToolbar, Position } from "@xyflow/react"; // Remember to import Position
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

export default function GenerateToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  initialModel,
}: GenerateToolbarProps) {
  const nodesData = useNodesData(id || "");
  const usecase =
    nodesData?.type === "outputImageAdvanced"
      ? ConversationType.ADVANCE
      : nodesData?.type === "generateVideo"
        ? ConversationType.VIDEO
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
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
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
        className={`ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex origin-top items-center gap-2 rounded-full border border-[#1D1D1D] bg-[#121212] p-1.5 shadow-2xl transition-all duration-300 ${
          isActive
            ? `translate-y-0 scale-100 ${selected ? "opacity-100" : "opacity-80 hover:opacity-100"}`
            : "pointer-events-none -translate-y-4 scale-90 opacity-0"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Palette Section */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-3 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Palette className="size-4" />
          <ChevronDown className="size-3 opacity-50" />
        </button>

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
          <SelectTrigger className="flex h-9 items-center gap-2 rounded-full border-0 bg-[#1A1A1A] pl-1 pr-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
            <SelectValue placeholder="Select model" />
            <ChevronDown className="size-3 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.id} value={model.model_name}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-7 overflow-hidden rounded-sm bg-cover bg-center"
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
        <button className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
          <Sparkles className="size-4" />
        </button>

        {/* Download Button */}
        {imageUrl && (
          <button
            onClick={handleDownload}
            className="flex size-9 items-center justify-center rounded-full bg-[#1A1A1A] text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Download Generated Image"
          >
            <Download className="size-4" />
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
