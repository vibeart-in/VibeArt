export interface HeroSlide {
  id: string;
  image: string;
  gradient: {
    primary: string;
    secondary: string;
    accent1: string;
    accent2: string;
    accent3: string;
    highlight1: string;
    highlight2: string;
  };
  title?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: "blue-hero",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/hero1.webp",
    gradient: {
      primary: "#1A2B5E", // Deep blue base
      secondary: "#5E94FF", // Main blue glow
      accent1: "#9DD2FF", // Lighter blue glow
      accent2: "#C7D9FF", // White dress tint
      accent3: "#3559B2", // Mid-range blue
      highlight1: "#7FC2FF", // Bright blue highlight
      highlight2: "#4D80FF", // Stronger blue highlight
    },
    title: "Unleash celestial beauty with vivid AI art!",
  },
  {
    id: "dark-blue-hero", // Changed to better reflect its content - now a golden fairy
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/anime_girl.webp",
    gradient: {
      primary: "#1A2B5E", // Deep dark blue
      secondary: "#2C4A8C", // Medium dark blue
      accent1: "#3B5998", // Lighter dark blue
      accent2: "#4A6FA5", // Blue-grey tone
      accent3: "#0F1B3C", // Very dark navy blue
      highlight1: "#5A7BC8", // Brighter blue highlight
      highlight2: "#6B8DD6", // Lighter blue accent
    },
    title: "Create enchanting scenes with sunlit AI art!",
  },
  {
    id: "black-hero", // Changed to better reflect its content - now a monochromatic aesthetic
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/dark_girl.webp",
    gradient: {
      primary: "#000000", // Pure black
      secondary: "#333333", // Dark grey
      accent1: "#666666", // Medium grey
      accent2: "#999999", // Light grey
      accent3: "#1A1A1A", // Very dark grey
      highlight1: "#CCCCCC", // Light grey highlight
      highlight2: "#FFFFFF", // Pure white highlight
    },
    title: "Capture your vision with striking AI visuals!",
  },
  {
    id: "buger-hero",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/buger.webp",
    gradient: {
      primary: "#FFD700", // Cheese/dominant yellow
      secondary: "#FF9800", // Warm orange/bun
      accent1: "#5FB34A", // Lettuce green
      accent2: "#FFEB8E", // Lighter bun color
      accent3: "#8B4513", // Patty brown
      highlight1: "#FF4500", // Tomato red
      highlight2: "#FFC107", // Bright yellow cheese
    },
    title: "Cook up delicious images with AI innovation!",
  },
  {
    id: "realistic-portrait-hero", // Renamed for clarity
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/anime_girl3.webp", // This image is a realistic woman, not anime.
    gradient: {
      primary: "#FFD700",
      secondary: "#FFE066",
      accent1: "#FFF8DC",
      accent2: "#FFF5E1",
      accent3: "#FFECB3",
      highlight1: "#FFA500",
      highlight2: "#FFB300",
    },
    title: "Generate realistic portraits with artistic AI flair!",
  },
  {
    id: "red-saree-hero", // Renamed for clarity
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/desi1.webp",
    gradient: {
      primary: "#B22222", // Deep saree red
      secondary: "#FFD700", // Gold accents/bokeh
      accent1: "#DC143C", // Brighter red
      accent2: "#FFCC00", // Lighter gold
      accent3: "#E4B999", // Skin tone
      highlight1: "#FF4500", // Vibrant orange/red bokeh
      highlight2: "#C63030", // Rich red highlight
    },
    title: "Adorn your projects with vibrant cultural AI art!",
  },
  {
    id: "blue-saree-hero", // Renamed for clarity
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/desi2.webp",
    gradient: {
      primary: "#2A488B", // Deep saree blue
      secondary: "#4169E1", // Brighter blue
      accent1: "#C0C0C0", // Silver accents
      accent2: "#D3D3D3", // Background light grey
      accent3: "#87CEEB", // Lighter sky blue for contrast/reflection
      highlight1: "#6495ED", // Vibrant blue highlight
      highlight2: "#9FBCE2", // Softer blue from fabric
    },
    title: "Embrace elegance with serene traditional AI images!",
  },
  {
    id: "glowing-silhouette-hero", // Renamed for clarity
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/hero/anime_girl4.webp",
    gradient: {
      primary: "#1A0D2E", // Dark purple background
      secondary: "#4A1A5C", // Deep purple in silhouette
      accent1: "#8A2BE2", // Blue violet glow
      accent2: "#DA70D6", // Orchid glow
      accent3: "#2E0A3D", // Very dark purple
      highlight1: "#9370DB", // Medium slate blue
      highlight2: "#BA55D3", // Medium orchid highlight
    },
    title: "Discover mystique in your creations with luminous AI!",
  },
];
