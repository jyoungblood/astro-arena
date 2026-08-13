import { defineCollection } from "astro:content";
import { arena } from "astro-arena";

const block = {
  id: 201,
  base_type: "Block",
  type: "Text",
  content: { markdown: "Live fixture", html: "<p>Live fixture</p>", plain: "Live fixture" },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

const fixtureFetch: typeof fetch = async () =>
  Response.json({
    data: [block],
    meta: { current_page: 1, total_pages: 1, total_count: 1, has_more_pages: false },
  });

const staticChannel = defineCollection({
  loader: arena.channel({ id: "fixture-channel", fetch: fixtureFetch }),
});

export const collections = { staticChannel };
