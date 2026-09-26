import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const snippets = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!**/*.template.{md,mdx}", "!**/_*.{md,mdx}"],
    base: "./src/content/snippets",
  }),
  schema: z.object({
    title: z.string(),
    category: z.enum([
      "Sprites & Pixel Art",
      "Loaders & Spinners",
      "Buttons",
      "Glow & Glass",
    ]),
    tags: z.array(z.string()).default([]),
    cssCode: z.string(),
    htmlCode: z.string().optional(),
    reactCode: z.string(),
    defaultSpeed: z.number().default(0.8),
  }),
});

export const collections = { snippets };
