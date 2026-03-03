"use client";

import React from "react";
import { Plus, Shapes, History, Scan, Paintbrush, MessageCircle, HelpCircle } from "lucide-react";

export default function SideToolbar() {
  const topAction = {
    title: "Add Node",
    icon: <Plus className="h-6 w-6 text-neutral-900" />,
  };

  const tools = [
    { title: "Elements", icon: <Shapes className="h-5 w-5" /> },
    { title: "History", icon: <History className="h-5 w-5" /> },
    { title: "Scan", icon: <Scan className="h-5 w-5" /> },
    { title: "Appearance", icon: <Paintbrush className="h-5 w-5" /> },
    { title: "Comments", icon: <MessageCircle className="h-5 w-5" /> },
    { title: "Help", icon: <HelpCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="pointer-events-auto absolute left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-4 rounded-3xl border border-white/5 bg-neutral-900/50 p-2 shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
      {/* Top action button */}
      <button
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm transition-all hover:scale-105 hover:bg-neutral-100 active:scale-95"
        title={topAction.title}
      >
        {topAction.icon}
      </button>

      {/* Middle tools */}
      <div className="flex flex-col items-center gap-5 py-2 text-neutral-400">
        {tools.map((tool, idx) => (
          <button
            key={idx}
            className="transition-colors duration-200 hover:text-white"
            title={tool.title}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="my-1 h-[1px] w-6 bg-neutral-700/50" />

      {/* User Avatar */}
      <button
        className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-neutral-500"
        title="User Profile"
      >
        <img
          src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0"
          alt="User avatar"
          className="h-full w-full object-cover"
        />
      </button>
    </div>
  );
}
