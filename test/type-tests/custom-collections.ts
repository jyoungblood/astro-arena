/// <reference path="../../node_modules/astro/types/content.d.ts" />

import { defineCollection } from "astro:content";
import { arena } from "../../src/index.js";

const client = arena.client({ token: false });

export const singletonCollection = defineCollection({
  loader: async () => {
    const user = await client.users.get("are-na-team");
    return [{ id: `user:${user.id}`, resource: user }];
  },
});

export const listCollection = defineCollection({
  loader: async () => {
    const page = await client.channels.contents("arena-influences", { page: 1, per: 12 });
    return page.data.map((resource) => ({
      id: resource.type === "Channel" ? `channel:${resource.id}` : `block:${resource.id}`,
      resource,
    }));
  },
});

export const mixedCollection = defineCollection({
  loader: async () => {
    const page = await client.search.query({ query: "visual research" });
    return page.data.map((resource) => ({
      id: `${resource.type.toLowerCase()}:${resource.id}`,
      resource,
    }));
  },
});
