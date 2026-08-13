import { defineCollection } from "astro:content";
import { arena } from "astro-arena";

const block = {
  id: 101,
  base_type: "Block",
  type: "Text",
  content: { markdown: "Fixture text", html: "<p>Fixture text</p>", plain: "Fixture text" },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

const fixtureFetch: typeof fetch = async (input) => {
  const url = input instanceof Request ? input.url : String(input);
  const data = url.includes("/contents")
    ? {
        data: [block],
        meta: { current_page: 1, total_pages: 1, total_count: 1, has_more_pages: false },
      }
    : block;
  return Response.json(data, { headers: { ETag: '"fixture"' } });
};

const channel = defineCollection({
  loader: arena.channel({ id: "fixture-channel", fetch: fixtureFetch }),
});

const featured = defineCollection({
  loader: arena.block({ id: 101, fetch: fixtureFetch }),
});

export const collections = { channel, featured };
