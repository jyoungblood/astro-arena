# astro-arena

Use the Are.na v3 API in Astro content collections.

`astro-arena` provides loaders for Are.na channels and blocks. It also provides the complete official Are.na SDK for custom collections.

## Requirements

- Astro 6 or Astro 7
- Node.js 20 or a newer version
- An Are.na token for private resources

## Install

Install the package with your package manager.

```sh
pnpm add astro-arena
```

## Load a channel

Add a content configuration at `src/content.config.ts`.

```ts
import { defineCollection } from "astro:content";
import { arena } from "astro-arena";

const references = defineCollection({
  loader: arena.channel({
    url: "https://www.are.na/are-na-team/arena-influences",
    query: {
      page: 1,
      per: 24,
      sort: "position_desc",
    },
  }),
});

export const collections = { references };
```

The loader gets one page for each content synchronization. It never gets all pages automatically.

Blocks use their Are.na ID as the entry ID. For example, block `45029519` has the entry ID `"45029519"`.

### Use channel entries

Use the standard Astro content functions in a page.

```astro
---
import { getCollection, render } from "astro:content";

const references = await getCollection("references");
const first = references[0];
const rendered = first ? await render(first) : undefined;
const Content = rendered?.Content;
---

<h1>References</h1>
{Content && <Content />}
```

Text blocks supply `body` and `rendered.html`. Other resources use their description when one exists.

## Load one block

Use `arena.block()` for one full block.

```ts
const featured = defineCollection({
  loader: arena.block({ id: 45029519 }),
});
```

You can also supply a block URL.

```ts
const featured = defineCollection({
  loader: arena.block({ url: "https://www.are.na/block/45029519" }),
});
```

## Keep nested channels

The channel loader excludes nested channels by default. Set `includeChannels` to keep them.

```ts
const references = defineCollection({
  loader: arena.channel({
    url: "https://www.are.na/are-na-team/arena-influences",
    includeChannels: true,
  }),
});
```

Nested channels use `channel:{id}` as the entry ID. This prefix prevents a collision with a block ID.

## Access private content

> **WARNING:** A static build can copy private Are.na content into public site files. Inspect the build output before deployment.

Add the token to `.env` during local development.

```dotenv
ARENA_BEARER_TOKEN=replace_with_your_token
```

The package reads this value through `astro:env/server`. It does not import the token into client code.

Do not commit `.env`. The package uses anonymous requests when the variable does not exist.

Set `token: false` to force an anonymous request.

```ts
const publicReferences = defineCollection({
  loader: arena.channel({ id: "arena-influences", token: false }),
});
```

Read [Authentication and private content](docs/authentication.md) before you build a private collection.

## Use the complete Are.na SDK

`arena.client()` returns the official `@aredotna/sdk` client. You can use it inside `defineCollection()` for any v3 resource.

```ts
const client = arena.client();

const people = defineCollection({
  loader: async () => {
    const page = await client.users.followers("are-na-team", { page: 1, per: 24 });

    return page.data.map((user) => ({
      id: `user:${user.id}`,
      resource: user,
    }));
  },
});
```

The client includes users, groups, feeds, notifications, search, and all other v3 resources. The `astro-arena/api` path exports generated operations and types.

Read [Custom SDK collections](docs/custom-collections.md) for singleton, list, and mixed-resource examples.

## Live collections

`arena.liveChannel()` gets one channel page when a server request needs it. Live collections require a server adapter.

Use a live collection only when request-time data is necessary. The loader does not poll Are.na.

See [Live collections](docs/live-collections.md) for the Astro 7 configuration and cache behavior.

## Troubleshooting

### The loader returns `AUTHENTICATION_ERROR`

Make sure that `ARENA_BEARER_TOKEN` contains a valid token. Make sure that the build process can read the variable.

### A private resource returns `NOT_FOUND`

Are.na can hide a private resource from an account without access. Make sure that the token owner can open the resource.

### The collection does not contain every channel item

Set `page` and `per` in the channel query. The loader gets one page and never follows every page automatically.

### A nested channel is missing

Set `includeChannels: true`. The default collection contains blocks only.

Read [Troubleshooting](docs/troubleshooting.md) for more errors and corrective actions.

## Documentation

- [Documentation index](docs/README.md)
- [Getting started](docs/getting-started.md)
- [Loader API](docs/loaders.md)
- [Authentication and private content](docs/authentication.md)
- [Custom SDK collections](docs/custom-collections.md)
- [Live collections](docs/live-collections.md)
- [Pagination and filters](docs/pagination-and-filters.md)
- [Data and rendering](docs/data-and-rendering.md)
- [Caching and errors](docs/caching-and-errors.md)
- [Security and deployment](docs/security-and-deployment.md)
- [Release version 0.1.0](docs/releasing.md)
- [Troubleshooting](docs/troubleshooting.md)

## API sources

- [Astro content loader reference](https://docs.astro.build/en/reference/content-loader-reference/)
- [Are.na v3 API explorer](https://www.are.na/developers/explore)
- [Official Are.na SDK](https://github.com/aredotna/sdk)

## License

MIT
