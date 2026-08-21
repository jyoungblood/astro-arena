# astro-arena

![Astro + Are.na](./docs/assets/astro-arena.svg)

Astro content collections that use the Are.na v3 API.

`astro-arena` provides loaders for Are.na channels and blocks. It also provides the complete official Are.na SDK for custom collections.


See the [demo implementation](https://astro-arena.pages.dev) (and [check the source](https://github.com/jyoungblood/astro-arena-demo))


## Requirements

- Astro 6 or Astro 7
- Node.js 20 or a newer version
- [Are.na API token](https://www.are.na/developers/personal-access-tokens) for private resources

## Install

```sh
npm install astro-arena
```

## Load a channel

Add a content configuration at `src/content.config.ts`.

```ts
import { defineCollection } from "astro:content";
import { arena } from "astro-arena";

const references = defineCollection({
  loader: arena.channel({
    url: "https://www.are.na/j-youngblood/posters-ugpnnka-71q",
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

The `sort` value controls the Are.na response and page selection. Astro does not keep this order in a build-time collection.

Sort the result from `getCollection()` when display order is important. Read [Pagination and filters](docs/pagination-and-filters.md#build-time-collection-order).

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

`arena.liveChannel()` gets one channel page during each server request. It does not run in browser JavaScript.

A site can keep static pages. Each live-collection route requires on-demand rendering and a server adapter.

Read [Astro live content collections](https://docs.astro.build/en/guides/content-collections/#live-content-collections) for rendering requirements. See [Live collections](docs/live-collections.md) for configuration and cache behavior.

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

astro-arena is available under the [MIT License](./LICENSE).
