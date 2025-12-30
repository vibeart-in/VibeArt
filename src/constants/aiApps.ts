export interface AiAppParameter {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
  description: string;
  fieldData?: string;
}

export interface AiApp {
  id: string;
  created_at: string;
  app_name: string;
  description: string;
  runs: number;
  author: string;
  webappId: string;
  parameters: string; // JSON string of AiAppParameter[]
  cover_image: string;
  examples_images: string | null; // JSON string of string[] or null
  duration: string;
  cost: number;
  tags: string; // JSON string of string[]
  instance_type: string;
}

export const AI_APPS: AiApp[] = [
  {
    "created_at": "2025-11-03 07:58:08.252772+00",
    "app_name": "Custom sticker pack",
    "description": "Create 9 unique stickers with your custom face ",
    "runs": 0,
    "author": "nóng yù",
    "webappId": "1985245814048104449",
    "parameters": "[{\"nodeId\": \"16\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"image\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/custom_sticker/custom-stickers-cover.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/custom_sticker/example2.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/custom_sticker/example3.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/custom_sticker/example4.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/custom_sticker/example1.webp\"]",
    "duration": "180",
    "cost": 6,
    "tags": "[\"sticker\"]",
    "id": "0078075f-17eb-44d7-9b5c-94479a721437",
    "instance_type": "default"
  },
  {
    "created_at": "2025-11-04 16:23:21.805338+00",
    "app_name": "Add Pikachu with sound effect ",
    "description": "Upload your image and a cute Pikachu will find you. Its that easy",
    "runs": 0,
    "author": "ài xuéxí",
    "webappId": "1956301798472646657",
    "parameters": "[{\"nodeId\": \"132\", \"fieldName\": \"image\", \"fieldValue\": \"b6701c9a3ea39b0f9df159368f3a61c03490a7a78eed7a1315bb29bc4ea5d8ae.jpg\", \"description\": \"Upload image\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/pika%20pika/WanVideo2_2_I2V_00001_p82-audio_psdev_1762268207.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/pika%20pika/WanVideo2_2_I2V_00001_p85-audio_iamnq_1762268593.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/pika%20pika/pika_example.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/pika%20pika/WanVideo2_2_I2V_00001-audio_khrhd_1755480693.mp4\"]",
    "duration": "300",
    "cost": 8,
    "tags": "[\"add pika\"]",
    "id": "10677e8f-93bb-4f5a-9f4c-4ab2e5a5d89b",
    "instance_type": "default"
  },
  {
    "created_at": "2025-10-02 07:01:47.274481+00",
    "app_name": "Upscale any image to 4K",
    "description": "An AI-powered smart upscaler that transforms your images into stunning 4K quality. Not just resizing — it intelligently enhances textures, restores details, and adds realism where needed, making every image sharper, clearer, and lifelike.",
    "runs": 0,
    "author": "Wanrley Designer",
    "webappId": "1907581130097192962",
    "parameters": "[{\"nodeId\": \"2\", \"fieldName\": \"image\", \"fieldValue\": \"pasted/c94c904af82ab967764210542f7d1b6965071127c86459a705c1b21347e7d051.png\", \"description\": \"image\"}, {\"nodeId\": \"161\", \"fieldName\": \"value\", \"fieldValue\": \"1.0000000000000002\", \"description\": \"Denoise (Control Net)\"}, {\"nodeId\": \"160\", \"fieldName\": \"value\", \"fieldValue\": \"0.25000000000000006\", \"description\": \"Denoise (Upscale)\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/4k_video_cover.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example1.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example2.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example3.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example4.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example5.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example6.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example7.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/example8.webp\"]",
    "duration": "180",
    "cost": 8,
    "tags": "[\"upscale\"]",
    "id": "108fa3df-6a1a-460b-aecb-cd1f025d4534",
    "instance_type": "default"
  },
  {
    "created_at": "2025-11-02 12:10:18.600374+00",
    "app_name": "AI short film told in 3 scenes",
    "description": "Create a cinematic short story told through just three AI-generated shots.",
    "runs": 0,
    "author": "Qiu Ju",
    "webappId": "1982060072979308545",
    "parameters": "[{\"nodeId\": \"59\", \"fieldName\": \"text\", \"fieldValue\": \"Based on the character in the image, please ensure the character in the image is consistent with the reference image, maintaining the same visual characteristics. This is a set of three cinematic, artistic portrait photos, set in a city street corner at dawn or dusk, with faint neon lights. The first image is a medium shot, showing the character's back as they stand in the middle of a zebra crossing, surrounded by blurred light trails from passing cars. The second image is a close-up, showing the character's profile, gazing at a shop window, with neon lights reflected on their face. The third image is a close-up, showing the character looking directly at the camera, their gaze firm yet slightly lost. The overall color scheme is a cyberpunk-inspired cool blue, mimicking the texture of film reel, with strong grain, slightly high contrast, and bluish undertones in the shadows. The lighting comes from the ambient neon lights, creating a sense of narrative and detachment. The three images are combined into a three-panel layout.\", \"description\": \"Scene character prompt words\"}, {\"nodeId\": \"61\", \"fieldName\": \"text\", \"fieldValue\": \"“-Why is this city so quiet?-”\\n“-Even the neon lights can't answer-”\\n“-Maybe the answer is around the next corner-”\", \"description\": \"Subtitle dialogue prompt words\"}, {\"nodeId\": \"5\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"Character Image\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/three_grid_story%20/three_grid_story.webp",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/three_grid_story%20/ComfyUI_00001_xzgxg_1761534486.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/three_grid_story%20/ComfyUI_00001_flyec_1761816510.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/three_grid_story%20/ComfyUI_00002_krvxg_1761751284.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/three_grid_story%20/Output.jpg\"]",
    "duration": "60",
    "cost": 6,
    "tags": "[\"story\"]",
    "id": "12202b17-c024-49a9-a21a-2b17f40cc756",
    "instance_type": "default"
  },
  {
    "created_at": "2025-11-03 06:13:13.854536+00",
    "app_name": "Mecha Transformation ",
    "description": "Upload your photo to unleash your mech, your epic transformation awaits you!",
    "runs": 0,
    "author": "gāncuì miàn",
    "webappId": "1959091909098680322",
    "parameters": "[{\"nodeId\": \"165\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"Characters that need to transform\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/mech_transformation/cover.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/mech_transformation/example1.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/mech_transformation/example2.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/mech_transformation/example3.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/mech_transformation/example4.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/mech_transformation/example5.mp4\"]",
    "duration": "240",
    "cost": 6,
    "tags": "[\"character transformation\"]",
    "id": "15e3e3ee-27f9-4904-8055-caa00a92ec0e",
    "instance_type": "default"
  },
  {
    "created_at": "2025-10-14 19:01:59.235934+00",
    "app_name": "AI Girlfriend",
    "description": "Make your AI girlfriend anything ",
    "runs": 0,
    "author": "Ye Yu",
    "webappId": "1973221313714196481",
    "parameters": "[{\"nodeId\": \"135\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"Generate video from image\"}, {\"nodeId\": \"377\", \"fieldName\": \"select\", \"fieldValue\": \"1\", \"description\": \"Portrait or landscape mode\"}, {\"nodeId\": \"358\", \"fieldName\": \"select\", \"fieldValue\": \"14\", \"description\": \"POV interactive preset\"}, {\"nodeId\": \"434\", \"fieldName\": \"text\", \"fieldValue\": \"Strawberry\", \"description\": \"【】Custom, such as \\\"Feed【Food】\\\", here input \\\"strawberry\\\" would be \\\"Feed strawberry\\\".\"}, {\"nodeId\": \"453\", \"fieldName\": \"select\", \"fieldValue\": \"1\", \"description\": \"Camera movement\"}, {\"nodeId\": \"526\", \"fieldName\": \"select\", \"fieldValue\": \"1\", \"description\": \"Object gender\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Ai_girlfriend/AI-girlfriend-thumbnail2.mp4",
    "examples_images": null,
    "duration": "300",
    "cost": 10,
    "tags": "[\"AI girlfriend\",\"Image to video\"]",
    "id": "2e10a43b-ed29-4bdd-a298-091779a04b15",
    "instance_type": "default"
  },
  {
    "created_at": "2025-11-04 17:45:15.773413+00",
    "app_name": "Create quick and easy short films",
    "description": "AI short drama character performance.\nAfter the prompt, you can input x (1 5): representing the amplitude of character actions, y (1 5): representing the speed of background changes, z (1 5): representing the amount of special effects",
    "runs": 0,
    "author": "Wuji",
    "webappId": "1978786633266958338",
    "parameters": "[{\"nodeId\": \"267\", \"fieldName\": \"image\", \"fieldValue\": \"341a9d4d545fbd272f49e35dd7bc0b515aa0d80627018b44133a3cbf808875b3.png\", \"description\": \"Image\"}, {\"nodeId\": \"287\", \"fieldName\": \"value\", \"fieldValue\": \"A boy skateboards rapidly down the street x3 y5 z3\", \"description\": \"Prompt\"}, {\"nodeId\": \"263\", \"fieldName\": \"value\", \"fieldValue\": \"480\", \"description\": \"Width\"}, {\"nodeId\": \"264\", \"fieldName\": \"value\", \"fieldValue\": \"832\", \"description\": \"Height\"}, {\"nodeId\": \"286\", \"fieldName\": \"value\", \"fieldValue\": \"5\", \"description\": \"Duration (seconds)\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/short_film/cover.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/short_film/example1.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/short_film/example2.mp4\"]",
    "duration": "240",
    "cost": 6,
    "tags": "[\"film\"]",
    "id": "4bd9d235-697a-4ee6-b204-ed594b3fb34d",
    "instance_type": "default"
  },
  {
    "created_at": "2025-10-01 14:51:40.741692+00",
    "app_name": "Image to 3d figurine (Image and video)",
    "description": "Transform any portrait into a photorealistic 3D figurine with an custom realistic video.",
    "runs": 0,
    "author": "Mr. Krabs",
    "webappId": "1956642227588136961",
    "parameters": "[{\"nodeId\": \"330\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"image\"}, {\"nodeId\": \"338\", \"fieldName\": \"prompt\", \"fieldValue\": \"The 1/7 scale commercial model of the figure in the picture has been completed, featuring a realistic style and lifelike environment. The model sits on a computer desk with a round, transparent acrylic base. The base is blank. The computer screen displays the ZBrush modeling process. Next to the screen is a Bandai-style toy box printed with the original artwork.\", \"description\": \"Banana prompt\"}, {\"nodeId\": \"494\", \"fieldName\": \"select\", \"fieldValue\": \"1\", \"description\": \"Character action selection\"}, {\"nodeId\": \"496\", \"fieldName\": \"text\", \"fieldValue\": \"The camera zooms out to a wide shot, revealing a figurine in front of it. A giant hand reaches out from outside the frame and grabs the figurine. The figurine is then placed in front of the camera, and its face is wiped with a towel.\", \"description\": \"Custom prompts for character actions\"}, {\"nodeId\": \"291\", \"fieldData\": \"[[\\\"1:1 (Perfect Square)\\\", \\\"2:3 (Classic Portrait)\\\", \\\"3:4 (Golden Ratio)\\\", \\\"3:5 (Elegant Vertical)\\\", \\\"4:5 (Artistic Frame)\\\", \\\"5:7 (Balanced Portrait)\\\", \\\"5:8 (Tall Portrait)\\\", \\\"7:9 (Modern Portrait)\\\", \\\"9:16 (Slim Vertical)\\\", \\\"9:19 (Tall Slim)\\\", \\\"9:21 (Ultra Tall)\\\", \\\"9:32 (Skyline)\\\", \\\"3:2 (Golden Landscape)\\\", \\\"4:3 (Classic Landscape)\\\", \\\"5:3 (Wide Horizon)\\\", \\\"5:4 (Balanced Frame)\\\", \\\"7:5 (Elegant Landscape)\\\", \\\"8:5 (Cinematic View)\\\", \\\"9:7 (Artful Horizon)\\\", \\\"16:9 (Panorama)\\\", \\\"19:9 (Cinematic Ultrawide)\\\", \\\"21:9 (Epic Ultrawide)\\\", \\\"32:9 (Extreme Ultrawide)\\\"], {\\\"default\\\": \\\"1:1 (Perfect Square)\\\"}]\", \"fieldName\": \"aspect_ratio\", \"fieldValue\": \"3:4 (Golden Ratio)\", \"description\": \"Set image ratio\"}, {\"nodeId\": \"324\", \"fieldName\": \"value\", \"fieldValue\": \"1280\", \"description\": \"The longest side of the video\"}, {\"nodeId\": \"477\", \"fieldName\": \"value\", \"fieldValue\": \"5\", \"description\": \"Time (s)\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/cover.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/lightx2v_00001_p82_jinba_1762263524%20(1).mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/WanVideo2_2_I2V_00001_p82_upzfo_1760938840.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/WanVideo2_2_I2V_00001_p84_mgzfs_1760800677.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/example1.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/example2.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/3d_figurine/example3.webp\"]",
    "duration": "480",
    "cost": 12,
    "tags": "[\"Image edit\",\"3d Figurine\"]",
    "id": "633bd8d5-e1ac-4314-bde8-125272928fa5",
    "instance_type": "plus"
  },
  {
    "created_at": "2025-11-02 19:17:36.088423+00",
    "app_name": "One click multiple consistent character poses",
    "description": "Get 8 Images with consistent character with different poses in high res",
    "runs": 0,
    "author": "Aijuxi",
    "webappId": "1965020046382743554",
    "parameters": "[{\"nodeId\": \"690\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"Upload person (frontal view, standing pose works better)\"}, {\"nodeId\": \"770\", \"fieldName\": \"value\", \"fieldValue\": \"1360\", \"description\": \"Maximum resolution (the larger, the slower)\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/consistent_character/10-consistent-character.jpg",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/consistent_character/example1.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/consistent_character/example2.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/consistent_character/example3.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/consistent_character/example4.webp\"]",
    "duration": "240",
    "cost": 6,
    "tags": "[\"consistent character\"]",
    "id": "6e62ea85-4062-456d-9891-ee0ac56bb6c6",
    "instance_type": "default"
  },
  {
    "created_at": "2025-10-03 11:47:34.991179+00",
    "app_name": "Pose transfer! Pose your model using doodles",
    "description": "Pose transfer! Pose your model using doodles",
    "runs": 0,
    "author": "Qski",
    "webappId": "1968922994280157185",
    "parameters": "[{\"nodeId\": \"16\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"Your model\"}, {\"nodeId\": \"3\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"Your Doodle\"}, {\"nodeId\": \"35\", \"fieldName\": \"boolean\", \"fieldValue\": \"false\", \"description\": \"Character turns right\"}, {\"nodeId\": \"58\", \"fieldName\": \"boolean\", \"fieldValue\": \"false\", \"description\": \"Keep the original props\"}, {\"nodeId\": \"11\", \"fieldName\": \"text\", \"fieldValue\": \"\", \"description\": \"Optional explanation\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/doodles_pose_transfer/pose-tranfer-cover.webp",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/doodles_pose_transfer/example1.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/doodles_pose_transfer/example2.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/doodles_pose_transfer/example4.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/doodles_pose_transfer/cover1.jpg\"]",
    "duration": "90",
    "cost": 5,
    "tags": "[\"pose tranfer\"]",
    "id": "7ca91622-4c0a-42f8-b4e4-dd2b51e0ca9e",
    "instance_type": "default"
  },
  {
    "created_at": "2025-11-04 17:06:16.669826+00",
    "app_name": "360° camera orbit",
    "description": "Experience smooth 360° camera motion that orbits perfectly around your subject — add cinematic depth and pro-level style to any scene. ",
    "runs": 0,
    "author": "Lucas",
    "webappId": "1985191253933441026",
    "parameters": "[{\"nodeId\": \"26\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"image\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/cover.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/WanVideo2_2_I2V_00002_p86_mxetk_1762275442.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/example1-small.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/360_orbit/cover.mp4\"]",
    "duration": "180",
    "cost": 6,
    "tags": "[\"360° orbit\"]",
    "id": "aae47442-b5ec-4946-9b76-eb468d6f5d60",
    "instance_type": "default"
  },
  {
    "created_at": "2025-10-14 18:58:59.226175+00",
    "app_name": "Dance or Action transfer",
    "description": "Transfer nay movement, action or dance to any character",
    "runs": 0,
    "author": "Charming",
    "webappId": "1970820800234328065",
    "parameters": "[{\"nodeId\": \"188\", \"fieldName\": \"video\", \"fieldValue\": \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/preview.mp4\", \"description\": \"Reference video\"}, {\"nodeId\": \"57\", \"fieldName\": \"image\", \"fieldValue\": \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/preview-image.jpg\", \"description\": \"Character image\"}, {\"nodeId\": \"192\", \"fieldName\": \"int\", \"fieldValue\": \"0\", \"description\": \"From which second to start (skip duration)\"}, {\"nodeId\": \"196\", \"fieldName\": \"int\", \"fieldValue\": \"10\", \"description\": \"Generated duration\"}, {\"nodeId\": \"197\", \"fieldName\": \"text\", \"fieldValue\": \"A woman dancing, uniform with coat outfit\", \"description\": \"Video description\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/Dance-tranfer-thumbnail2.mp4",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/example7.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/example4.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/example5.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/example6.mp4\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/example2.mp4\"]",
    "duration": "300",
    "cost": 20,
    "tags": "[\"Motion transfer\"]",
    "id": "eda689e8-0683-4290-86c4-f973532305f1",
    "instance_type": "plus"
  },
  {
    "created_at": "2025-11-02 17:14:44.280236+00",
    "app_name": "Anime to Real life",
    "description": "Upload a 2D image or anime, and help you generate a real-life effect\n",
    "runs": 0,
    "author": "AiArt-D",
    "webappId": "1985039322141380610",
    "parameters": "[{\"nodeId\": \"78\", \"fieldName\": \"image\", \"fieldValue\": \"\", \"description\": \"image\"}]",
    "cover_image": "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/anime_to_real/cover.webp",
    "examples_images": "[\"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/anime_to_real/4013e45565c03674f4c7445c24918b96.jpg\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/anime_to_real/example1.webp\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/anime_to_real/fef17947af805b0d9369da0d2442afcb.jpg\", \"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/anime_to_real/example2.webp\"]",
    "duration": "60",
    "cost": 4,
    "tags": "[\"anime to real\"]",
    "id": "f5e56ab0-9137-43fb-82c1-876b217f9904",
    "instance_type": "default"
  }
];
