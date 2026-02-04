import { Node, Edge } from '@xyflow/react';
import { Sparkles, Share2 } from "lucide-react";
import { 
  HeroTitleNode, 
  HeroAppCarouselNode, 
  HeroImageSlideshowNode, 
  HeroLabelNode, 
  HeroStatsNode, 
  HeroFireNode, 
  HeroVideoNode, 
  HeroFeatureNode, 
  HeroAppShowcaseNode 
} from "./HeroNodes";
import { CustomEdge } from "./CustomEdge";

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
};

export const edgeTypes = {
  custom: CustomEdge,
};

export const initialNodes: Node[] = [
  // --- Center ---
  {
    id: 'title',
    type: 'heroTitle',
    position: { x: 200.85494752885495, y: -115.66385215179193 },
    data: { },
  },

  // --- Top Layer ---
  {
    id: 'fire-node',
    type: 'heroFire',
    position: { x: 359.0077043245389, y: -470.58285816865083 },
    data: { },
  },
  {
    id: 'stat-users',
    type: 'heroStats',
    position: { x: -623.9322400355717, y: -479.44838545777924 },
    data: { value: "120k+", label: "Creators" },
  },
  {
      id: 'stat-gen',
      type: 'heroStats',
      position: { x: 1513.591562518975, y: -481.5493751138502 },
      data: { value: "2M+", label: "Generated" },
  },

  // --- Mid Layer ---
  {
    id: 'carousel',
    type: 'heroCarousel',
    position: { x: -590.8922920588174, y: 220.14093763282523 },
    data: { title: "AI Tools" },
  },
  {
    id: 'video-gen',
    type: 'heroVideo',
    position: { x: 662.0377085483838, y: 378.53499969639944 },
    data: { },
  },
  {
    id: 'slideshow',
    type: 'heroSlideshow',
    position: { x:1436.550138861337, y: 148.21012695893674 },
    data: { title: "Gallery" },
  },

  // --- Connection Labels ---
  {
    id: 'label-1',
    type: 'heroLabel',
    position: { x: 24, y: 578 },
    data: { label: "Input Modules", color: "bg-purple-600" },
  },
  {
    id: 'label-2',
    type: 'heroLabel',
    position: { x: 1386, y: -34 },
    data: { label: "Visual Output", color: "bg-[#d9e92b]/20" },
  },

  // --- Features ---
  {
    id: 'feature-1',
    type: 'heroFeature',
    position: { x: -291.64588591318005, y: -230.0610416793167 },
    data: { title: "Real-time Flow", description: "Experience generative art at the speed of thought.", icon: Sparkles, gradient: "from-yellow-400 to-orange-500" },
  },
  {
    id: 'feature-2',
    type: 'heroFeature',
    position: { x: 1074, y: -234 },
    data: { title: "Social Connect", description: "Instantly share your creations with the community.", icon: Share2, gradient: "from-blue-400 to-cyan-500" },
  },
  {
    id: 'app-showcase',
    type: 'heroShowcase',
    position: { x: -1330.1196572960876, y: -186.30985915492957 },
    data: { },
  },
];

export const initialEdges: Edge[] = [
  // Fire -> Title
  { id: 'e-fire-title', source: 'fire-node', target: 'title', targetHandle: 't-top', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2 } },
  
  // Carousel -> Label 1 -> Title
  { id: 'e-carousel-label1', source: 'carousel', sourceHandle: null, target: 'label-1', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  { id: 'e-label1-title', source: 'label-1', target: 'title', targetHandle: 't-left', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  
  // Title -> Label 2 -> Slideshow
  { id: 'e-title-label2', source: 'title', sourceHandle: 's-right', target: 'label-2', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  { id: 'e-label2-slideshow', source: 'label-2', target: 'slideshow', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  
  // Title -> Video
  { id: 'e-title-video', source: 'title', sourceHandle: 's-bottom', target: 'video-gen', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 3, opacity: 0.8 } },
  
  // Stats
  { id: 'e-stat-c', source: 'stat-users', target: 'carousel', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1 } },
  { id: 'e-stat-s', source: 'stat-gen', target: 'slideshow', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1 } },
 
  // Features
  { id: 'e-f1-c', source: 'feature-1', target: 'carousel', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1, strokeDasharray: '5,5' } },
  { id: 'e-f2-s', source: 'feature-2', target: 'slideshow', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1, strokeDasharray: '5,5' } },
 
  // Showcase
  { id: 'e-showcase-carousel', source: 'app-showcase', target: 'carousel', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 1, opacity: 0.4 } },
];
