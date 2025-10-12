import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import tailwind from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // ✅ Base Next.js + TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "build/",
      "coverage/",
      "public/",
      "**/*.config.js",
      "supabase/database.types.ts",
      "next-env.d.ts",
    ],
  },

  // ✅ Tailwind CSS plugin for class order & naming
  {
    plugins: { tailwindcss: tailwind },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/enforces-shorthand": "warn",
      "tailwindcss/no-custom-classname": "off",
    },
  },

  // ✅ TypeScript & React good practices
  {
    rules: {
      // 🧠 TypeScript
      "@typescript-eslint/no-explicit-any": "off", // Allow `any` (useful with Supabase)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/ban-ts-comment": "off",

      // ⚛️ React
      "react/react-in-jsx-scope": "off",
      "react/jsx-no-target-blank": ["warn", { allowReferrer: true }],
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",

      // 🪶 Imports
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // ⚙️ Code hygiene
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-var": "error",
      "prefer-const": "warn",
      "no-unused-vars": "off",
    },
  },

  // ✅ Tailwind config path
  {
    settings: {
      tailwindcss: {
        config: "tailwind.config.ts",
      },
    },
  },
];
