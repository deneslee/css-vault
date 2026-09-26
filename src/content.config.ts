// src/content.config.ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// A live control on a card: drives one CSS custom property of the preview.
// Each snippet declares the property it actually uses (e.g. --fire-duration,
// --run-speed), so every control works — no shared magic variable name.
const control = z.object({
  label: z.string(),
  property: z.string().startsWith("--"),
  type: z.enum(["range", "color"]),
  default: z.union([z.number(), z.string()]).transform(String),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  // Appended to range values when written to CSS, e.g. "s", "px", "deg".
  unit: z.string().optional(),
});

const snippets = defineCollection({
  // Files starting with "_" (like _template.md) are not snippets.
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!**/_*"],
    base: "./src/content/snippets",
  }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    // Zoom applied to the live preview only (useful for small pixel sprites).
    previewScale: z.number().positive().default(1),
    controls: z.array(control).default([]),
    cssCode: z.string(),
    htmlCode: z.string(),
    reactCode: z.string(),
  }),
});

export const collections = { snippets };
