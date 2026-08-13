# Getting started

## Requirements

Install Node.js 20 or a newer version. Use Astro 6 or Astro 7.

## Install the package

Run this command in an Astro project.

```sh
pnpm add astro-arena
```

## Create a channel collection

Create `src/content.config.ts`.

```ts
import { defineCollection } from "astro:content";
import { arena } from "astro-arena";

const references = defineCollection({
  loader: arena.channel({
    url: "https://www.are.na/are-na-team/arena-influences",
    query: { page: 1, per: 24 },
  }),
});

export const collections = { references };
```

Run the Astro development server.

```sh
pnpm astro dev
```

Astro synchronizes the requested channel page. The loader does not request later pages.

## Read the collection

Use `getCollection()` in an Astro page.

```astro
---
import { getCollection } from "astro:content";

const references = await getCollection("references");
---

<ul>
  {references.map((entry) => <li>{entry.data.title ?? entry.id}</li>)}
</ul>
```

## Add a block collection

Add another collection to the same configuration.

```ts
const featured = defineCollection({
  loader: arena.block({ id: 45029519 }),
});

export const collections = { featured, references };
```

Read [Loader API](loaders.md) for all specialized loader inputs.
