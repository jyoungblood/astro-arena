# Live collections

Live collections get data during each server request. They do not run in browser JavaScript.

A site can keep static pages. Each live-collection route requires on-demand rendering and a server adapter.

Read the [Astro live content guide](https://docs.astro.build/en/guides/content-collections/#live-content-collections) for the current Astro API.

## Configure an adapter

Install the adapter for the deployment service. Then set Astro to server output or use on-demand routes.

The package fixtures use the Node adapter.

```js
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  output: "server",
});
```

Read [Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) for adapter and output details.

## Define the collection

Create `src/live.config.ts`. Do not put a live collection in `src/content.config.ts`.

```ts
import { defineLiveCollection } from "astro:content";
import { arena } from "astro-arena";

const references = defineLiveCollection({
  loader: arena.liveChannel({
    id: "arena-influences",
    query: { page: 1, per: 24 },
  }),
});

export const collections = { references };
```

## Get a collection page

Use `getLiveCollection()` in a server route.

```astro
---
import { getLiveCollection } from "astro:content";

const { entries, error, cacheHint } = await getLiveCollection("references", {
  page: 1,
});

if (error) {
  return new Response(error.message, { status: 502 });
}
---

<p>{entries.length} entries</p>
```

## Get one entry

Use the specialized entry ID with `getLiveEntry()`.

```ts
const { entry, error } = await getLiveEntry("references", "45029519");
```

Use an ID such as `channel:123` for a nested channel. Set `includeChannels: true` in the loader configuration first.

Entry lookup searches the configured page. It returns no entry when the resource is on a different page.

## Cache hints

The loader supplies stable resource tags and a `lastModified` date. It does not supply a cache duration.

Add a cache duration only after you select a safe policy for the route. Do not apply a public cache policy to private content.

## No polling

The live loader makes an Are.na request when Astro calls the loader. It does not use polling or long polling.

Use a build-time loader when request-time freshness is not necessary. This selection reduces latency and Are.na API use.
