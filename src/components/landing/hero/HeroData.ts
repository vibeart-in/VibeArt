import { Node, Edge } from "@xyflow/react";

import { CustomEdge } from "./CustomEdge";
import HeroAiAppNode from "./nodes/HeroAiAppNode";
import HeroInputImage from "./nodes/HeroInputImage";
import { HeroTitleNode, HeroImageNode } from "./nodes/HeroNodes";
import HeroOutputImage from "./nodes/HeroOutputImage";

export const nodeTypes = {
  heroTitle: HeroTitleNode,
  inputImage: HeroInputImage,
  outputImage: HeroOutputImage,
  heroImage: HeroImageNode,
  aiApp: HeroAiAppNode,
};

export const edgeTypes = {
  custom: CustomEdge,
};

export const initialNodes: Node[] = [
  // {
  //   id: "heroImage",
  //   type: "heroImage",
  //   position: { x: 0, y: 0 },
  //   data: {},
  //   draggable: true,
  // },
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
      label: "dress_back",
      width: 450,
      height: 680,
      imageId: "51cd5b1c-bde9-4daf-9afe-d6f4d698dd39",
    },
    type: "inputImage",
    dragging: false,
    position: {
      x: 20,
      y: 80,
    },
  },
  {
    id: "4066d91f-2470-444c-b3be-ed3d8a5685b2",
    data: {
      url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/gwH9OiJdWV3YP3EzWN85o.webp",
      label: "dress_front",
      width: 640,
      height: 970,
      imageId: "cff3266e-00c4-4ea9-a570-aedd801e66d1",
    },
    type: "inputImage",

    dragging: false,
    position: {
      x: 20,
      y: 480,
    },
  },
  {
    id: "0c6ecb69-f831-4043-b7e4-ad7f6ad95664",
    data: {
      model: "Nano banana pro",
      title: "output",
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
      x: 300,
      y: 550,
    },
  },
  {
    id: "3f9b4030-612c-4ee7-8798-a0b2a829bf55",
    data: {
      model: "Nano banana pro",
      title: "output",
      width: 649,
      height: 975,
      prompt:
        "High-fashion editorial full body shot of an Asian model sitting on a sleek black abstract structure. She is wearing a chartreuse yellow asymmetrical draped top with a high-neck scarf detail, tucked into a champagne beige satin A-line midi skirt with a large bow at the waist. She is wearing tall black leather knee-high boots. She is striking a dynamic, edgy pose: seated with legs splayed, one knee bent high resting on the structure, the other leg extended downwards. Her arm rests casually on her knee. Intense, cool expression. Dark moody grey studio background, cinematic spotlighting, high contrast, Vogue magazine cover aesthetic, photorealistic, 8k resolution.",
      status: null,
      imageUrl:
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/26fc53c5-bbb6-453e-8d2c-44687ab2e7cb/0.jpeg",
      isSource: false,
      activeJobId: null,
      stylePrompt: "",
      outputImages: [
        {
          id: "0ad91505-e009-4b88-95c5-2273bbbc48dc",
          width: 1792,
          height: 2400,
          user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
          image_url:
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/26fc53c5-bbb6-453e-8d2c-44687ab2e7cb/0.jpeg",
          is_public: false,
          created_at: "2026-02-11T06:08:27.071721+00:00",
          thumbnail_url:
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/26fc53c5-bbb6-453e-8d2c-44687ab2e7cb/thumbnail/0.webp",
        },
      ],
      inputImageUrls: [
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/gwH9OiJdWV3YP3EzWN85o.webp",
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/hykOakhJQLCsBYeb6sY4G.webp",
      ],
    },
    type: "outputImage",
    width: 450,
    height: 603,
    measured: {
      width: 450,
      height: 603,
    },
    position: {
      x: 300,
      y: 280,
    },
  },
  {
    id: "e9fe739a-3318-4985-a8aa-b163da339715",
    data: {
      width: 649,
      height: 975,
      status: null,
      appData: {
        id: "aae47442-b5ec-4946-9b76-eb468d6f5d60",
        cost: 6,
        runs: 0,
        tags: ["360° orbit"],
        author: "Lucas",
        app_name: "360° camera orbit",
        duration: 180,
        webappId: "1985191253933441026",
        created_at: "2025-11-04T17:06:16.669826+00:00",
        parameters: [
          {
            nodeId: "26",
            fieldName: "image",
            fieldValue: "",
            description: "image",
          },
        ],
        cover_image:
          "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/cover.mp4",
        description:
          "Experience smooth 360° camera motion that orbits perfectly around your subject — add cinematic depth and pro-level style to any scene. ",
        instance_type: "default",
        examples_images: [
          "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/WanVideo2_2_I2V_00002_p86_mxetk_1762275442.mp4",
          "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/example1-small.mp4",
          "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/cover.mp4",
        ],
      },
      mainNodeId: "b8be99c6-b189-41d2-a2b0-76621b999759",
      activeJobId: null,
      hasGenerated: true,
      outputImages: [
        {
          images: {
            id: "6cbc4791-a4b3-47c3-a0d5-ac7e1e94eb4e",
            width: 512,
            height: 704,
            user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
            image_url:
              "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/f0f8dab8-42d4-4826-8514-e117d9790fb3/0.mov",
            is_public: false,
            created_at: "2026-02-11T14:28:57.660477+00:00",
            thumbnail_url:
              "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/f0f8dab8-42d4-4826-8514-e117d9790fb3/thumbnail/0.webp",
          },
        },
      ],
      outputNodeIds: ["b8be99c6-b189-41d2-a2b0-76621b999759"],
      inputImageUrls: [
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/26fc53c5-bbb6-453e-8d2c-44687ab2e7cb/0.jpeg",
      ],
      processedImagesHash: '["6cbc4791-a4b3-47c3-a0d5-ac7e1e94eb4e"]',
    },
    type: "aiApp",
    width: 200,
    height: 230,
    origin: [0, 0.5],
    measured: {
      width: 200,
      height: 230,
    },
    position: {
      x: 950,
      y: 550,
    },
  },
  {
    id: "b8be99c6-b189-41d2-a2b0-76621b999759",
    data: {
      model: "Nano banana pro",
      width: 649,
      height: 975,
      nodeWidth: 350,
      nodeHeight: 550,
      prompt: "",
      imageUrl:
        "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/4165c358-8eaf-4729-b3c0-6c7597ad0edd/f0f8dab8-42d4-4826-8514-e117d9790fb3/0.mov",
      stylePrompt: "",
    },
    type: "outputImage",
    width: 550,
    height: 750,
    dragging: false,
    measured: {
      width: 550,
      height: 750,
    },
    position: {
      x: 1200,
      y: 180,
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "edge-1",
    source: "552ead66-e1bf-4b21-afec-3075f3f15945",
    target: "0c6ecb69-f831-4043-b7e4-ad7f6ad95664",
    animated: true,
  },
  {
    id: "edge-5",
    source: "552ead66-e1bf-4b21-afec-3075f3f15945",
    target: "3f9b4030-612c-4ee7-8798-a0b2a829bf55",
    animated: true,
  },
  {
    id: "edge-6",
    source: "4066d91f-2470-444c-b3be-ed3d8a5685b2",
    target: "3f9b4030-612c-4ee7-8798-a0b2a829bf55",
    animated: true,
  },
  {
    id: "edge-2",
    source: "4066d91f-2470-444c-b3be-ed3d8a5685b2",
    target: "0c6ecb69-f831-4043-b7e4-ad7f6ad95664",
    animated: true,
  },
  {
    id: "edge-3",
    source: "3f9b4030-612c-4ee7-8798-a0b2a829bf55",
    target: "e9fe739a-3318-4985-a8aa-b163da339715",
    type: "custom",
    animated: true,
  },
  {
    id: "edge-4",
    source: "e9fe739a-3318-4985-a8aa-b163da339715",
    target: "b8be99c6-b189-41d2-a2b0-76621b999759",
    type: "custom",
    animated: true,
  },
];
