/// <reference path="../../node_modules/astro/types/content.d.ts" />

import { defineCollection } from "astro:content";
import { type GetUserData, getUser } from "../../src/api.js";
import { arena } from "../../src/index.js";

const references = defineCollection({
  loader: arena.channel({
    url: "https://www.are.na/are-na-team/arena-influences",
    query: { page: 1, per: 24, sort: "position_desc" },
  }),
});

const featured = defineCollection({ loader: arena.block({ id: 45029519 }) });
const nested = defineCollection({
  loader: arena.channel({ id: "arena-influences", includeChannels: true }),
});
const anonymous = defineCollection({
  loader: arena.channel({ id: "arena-influences", token: false }),
});

const client = arena.client();
const people = defineCollection({
  loader: async () => {
    const page = await client.users.followers("are-na-team", { page: 1, per: 24 });
    return page.data.map((user) => ({ id: `user:${user.id}`, resource: user }));
  },
});

const generatedOperation: typeof getUser = getUser;
type GeneratedInput = GetUserData;

export { anonymous, featured, type GeneratedInput, generatedOperation, nested, people, references };
