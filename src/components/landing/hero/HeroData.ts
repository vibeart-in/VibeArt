import { Node, Edge } from "@xyflow/react";
import { Sparkles, Share2 } from "lucide-react";

import { CustomEdge } from "./CustomEdge";
import {
  HeroTitleNode,
  HeroAppCarouselNode,
  HeroImageSlideshowNode,
  HeroLabelNode,
  HeroStatsNode,
  HeroFireNode,
  HeroVideoNode,
  HeroFeatureNode,
  HeroAppShowcaseNode,
  OutputImageNode,
  HeroImageNode,
} from "./HeroNodes";
import HeroInputImage from "./nodes/HeroInputImage";
import HeroOutputImage from "./nodes/HeroOutputImage";

export const nodeTypes = {
  heroTitle: HeroTitleNode,
  heroCarousel: HeroAppCarouselNode,
  heroSlideshow: HeroImageSlideshowNode,
  heroLabel: HeroLabelNode,
  heroStats: HeroStatsNode,
  heroFire: HeroFireNode,
  heroVideo: HeroVideoNode,
  heroFeature: HeroFeatureNode,
  heroShowcase: HeroAppShowcaseNode,
  inputImage: HeroInputImage,
  outputImage: HeroOutputImage,
  heroImage: HeroImageNode,
};

export const edgeTypes = {
  custom: CustomEdge,
  active: CustomEdge,
};

export const initialNodes: Node[] = [
  {
    id: "heroImage",
    type: "heroImage",
    position: { x: 0, y: 0 },
    data: {},
    draggable: true,
  },
  {
    id: "title",
    type: "heroTitle",
    position: { x: 0, y: 0 },
    data: {},
    draggable: true,
  },
  {
    id: "552ead66-e1bf-4b21-afec-3075f3f15945",
    data: {
      url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/oOEPJpDbUQm6-JzpQxm9P.webp",
      label: "dress_view_back.webp",
      width: 450,
      height: 680,
      imageId: "51cd5b1c-bde9-4daf-9afe-d6f4d698dd39",
    },
    type: "inputImage",
    dragging: false,
    position: {
      x: 100,
      y: 80,
    },
  },
  {
    id: "4066d91f-2470-444c-b3be-ed3d8a5685b2",
    data: {
      url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/gwH9OiJdWV3YP3EzWN85o.webp",
      label: "dress_view_front.webp",
      width: 640,
      height: 970,
      imageId: "cff3266e-00c4-4ea9-a570-aedd801e66d1",
    },
    type: "inputImage",

    dragging: false,
    position: {
      x: 100,
      y: 420,
    },
  },
  {
    id: "0c6ecb69-f831-4043-b7e4-ad7f6ad95664",
    data: {
      model: "Nano banana pro",
      title: "Image Generator",
      width: 649,
      height: 975,
      prompt:
        "Cinematic high-fashion editorial photograph of a model wearing a light-yellow asymmetric draped dress, shot from low angle (nadir to eye-level alternation), vibrant deep shadows and soft rim light, moody studio environment with textured backdrop (muted concrete or pastel gradient), wind gently moving fabric, dramatic composition, film-grain texture, medium format 85mm lens, shallow depth of field, high contrast color grade with warm highlights and cool shadows — magazine cover / center spread quality.\n",
      status: null,
      imageUrl:
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/6b4f019c-91fc-40b9-bd45-344b18a1e21b/0.jpeg",
      isSource: false,
      activeJobId: null,
      stylePrompt: "",
      outputImages: [
        {
          id: "abbcec71-1dfa-4f8f-9f36-c6340134d633",
          width: 1696,
          height: 2528,
          user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
          image_url:
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/6b4f019c-91fc-40b9-bd45-344b18a1e21b/0.jpeg",
          is_public: false,
          created_at: "2026-02-10T02:55:00.065474+00:00",
          thumbnail_url:
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/6b4f019c-91fc-40b9-bd45-344b18a1e21b/thumbnail/0.webp",
        },
      ],
      inputImageUrls: [
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/gwH9OiJdWV3YP3EzWN85o.webp",
      ],
    },
    type: "outputImage",
    width: 450,
    height: 670,
    dragging: false,
    measured: {
      width: 450,
      height: 671,
    },
    position: {
      x: 0,
      y: 0,
    },
    resizing: false,
    selected: true,
  },
];

export const initialEdges: Edge[] = [
  {
    id: "edge-1",
    source: "552ead66-e1bf-4b21-afec-3075f3f15945",
    target: "0c6ecb69-f831-4043-b7e4-ad7f6ad95664",
    type: "custom",
    animated: true,
  },
  {
    id: "edge-2",
    source: "4066d91f-2470-444c-b3be-ed3d8a5685b2",
    target: "0c6ecb69-f831-4043-b7e4-ad7f6ad95664",
    type: "custom",
    animated: true,
  },
];
