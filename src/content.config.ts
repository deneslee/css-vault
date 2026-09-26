// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const snippets = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/snippets" }),
  schema: z.object({
    title: z.string(), //[cite: 1]
    category: z.string(), //[cite: 1]
    tags: z.array(z.string()).default([]), //[cite: 1]
    defaultSpeed: z.number().default(1), //[cite: 1]
    cssCode: z.string(), //[cite: 1]
    htmlCode: z.string(), //[cite: 1]
    reactCode: z.string(), //[cite: 1]
  }),
});

export const collections = { snippets };
