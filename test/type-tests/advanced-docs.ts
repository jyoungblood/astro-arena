/// <reference path="../../node_modules/astro/types/content.d.ts" />

import { defineCollection } from "astro:content";
import type { Block } from "@aredotna/sdk";
import { arena } from "../../src/index.js";

const references = defineCollection({
  loader: arena.channel({
    id: "arena-influences",
    query: { page: 2, per: 50 },
    retry: { maxRetries: 2, respectRateLimits: true },
  }),
});

const client = arena.client();

async function pages() {
  for await (const page of client.channels.paginateContents("arena-influences", { per: 50 })) {
    for (const resource of page.data) {
      console.log(resource.id);
    }
  }
}

const feed = defineCollection({
  loader: async () => {
    const page = await client.me.feed({ limit: 24 });
    return page.data.map((item) => ({ id: `activity:${item.id}`, resource: item }));
  },
});

const notifications = defineCollection({
  loader: async () => {
    const page = await client.me.notifications({ limit: 24 });
    return page.data.map((item) => ({ id: `notification:${item.id}`, resource: item }));
  },
});

function imageAlt(entry: Block): string | undefined | null {
  return entry.type === "Image" ? entry.image.alt_text : undefined;
}

export { feed, imageAlt, notifications, pages, references };
