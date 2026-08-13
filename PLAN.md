# `astro-arena` Project Plan

## Purpose

`astro-arena` is an Astro content loader for the Are.na v3 API.

The package provides specialized loaders for Are.na channels and blocks. It also exposes the official Are.na SDK for other API resources.

This package is an unofficial community project. It is not affiliated with Astro or Are.na.

## Reference Material

- [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro community loaders](https://astro.build/blog/community-loaders/)
- [Are.na v3 API explorer](https://www.are.na/developers/explore)
- [Are.na API article](https://www.are.na/editorial/on-our-api)
- [Official `@aredotna/sdk`](https://github.com/aredotna/sdk)
- [Astro feed loader](https://github.com/ascorbic/astro-loaders/tree/main/packages/feed)

## Supported Platforms

- Astro 6 and Astro 7
- Node.js 20 or newer
- ESM projects
- Build-time content collections
- Live content collections with a server adapter

Astro 5 is outside the version 1 scope.

## Package API

The package exports one `arena` namespace:

```ts
import { arena } from "astro-arena";
```

The namespace contains these functions:

- `arena.channel()` returns a build-time channel loader.
- `arena.block()` returns a build-time block loader.
- `arena.liveChannel()` returns a live channel loader.
- `arena.client()` returns the official Are.na SDK client.

The `astro-arena/api` subpath re-exports the generated SDK operations and types.

### Channel loader

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

`arena.channel()` accepts an Are.na URL, channel slug, or numeric channel ID.

The loader fetches one page by default. It never walks every page automatically.

The `query` property accepts the official `ChannelContentsOptions` type. The loader sends supported query parameters to Are.na without changes.

The collection contains blocks by default. Set `includeChannels: true` to retain nested channels.

Block entry IDs use the original numeric ID as a string. Nested channel IDs use `channel:{id}` to prevent collisions.

### Block loader

```ts
const featured = defineCollection({
  loader: arena.block({
    id: 45029519,
  }),
});
```

`arena.block()` accepts an Are.na block URL or numeric block ID. It stores one full block as one collection entry.

### Live channel loader

```ts
import { defineLiveCollection } from "astro:content";
import { arena } from "astro-arena";

const references = defineLiveCollection({
  loader: arena.liveChannel({
    url: "https://www.are.na/are-na-team/arena-influences",
  }),
});

export const collections = { references };
```

Live collections fetch data at request time. They require an Astro server adapter.

The live loader does not poll Are.na. Each `getLiveCollection()` or `getLiveEntry()` call causes a request unless the application caches it.

Runtime filters override query values from the loader configuration.

Live collection results cannot expose Are.na pagination metadata. Applications that need this metadata must use `arena.client()`.

### SDK client

`arena.client()` gives applications typed access to the full official SDK.

It supports users, groups, feeds, followers, notifications, search, channel metadata, and other v3 operations.

The SDK includes write operations. The `astro-arena` documentation focuses on read operations.

The client can also supply data to a custom Astro collection:

```ts
const followers = defineCollection({
  loader: async () => {
    const response = await arena
      .client()
      .users.followers("damon-zucconi", { page: 1, per: 24 });

    return Object.fromEntries(
      response.data.map((user) => [`user:${user.id}`, user]),
    );
  },
});
```

Use an object key as the Astro entry ID. Keep the original Are.na ID inside the resource data.

Use a resource prefix for mixed collections. Examples include `user:12`, `block:34`, and `channel:56`.

Functional Astro loaders do not receive the specialized ETag, rendering, or error behavior from `arena.channel()` and `arena.block()`.

## Authentication

Public Are.na resources do not require a token.

If the `token` option is absent, the package reads `ARENA_BEARER_TOKEN` through the Astro server secret API.

If the variable is absent, the package sends an anonymous request. Set `token: false` to force anonymous access.

A token string or token getter overrides the environment variable.

The package must not include a token in logs, errors, snapshots, fixtures, cache metadata, or generated files.

CAUTION: A static site can publish private Are.na content in its generated output. Authentication protects the API request, not the site output.

CAUTION: A public live route can expose private Are.na content. If the content is private, the application must protect the route.

## Data and Rendering

The loaders preserve the original SDK `Block` and `Channel` objects.

This behavior retains these fields:

- Block type and content
- Connection position
- Pinned state
- Connection metadata
- Resource metadata
- Embedded user data
- Are.na links
- Resource abilities when the API supplies them

The loaders support all current Are.na block types:

- Text
- Image
- Link
- Attachment
- Embed
- Pending block

Text content populates the Astro entry `body` and `rendered.html` fields. Descriptions populate these fields when text content is absent.

The package uses permissive runtime schemas with official SDK types. This design keeps type information and permits additive API fields.

A schema in `defineCollection()` overrides the loader schema. The documentation explains this Astro behavior.

The package does not download or transform Are.na images. The documentation explains remote images, image variants, and `alt_text`.

## Pagination and Filtering

The channel loader fetches one page for each synchronization.

Users control the page with `page` and `per`. The API permits at most 100 items per page.

The package does not include an option that fetches an entire channel.

Applications can use the SDK pagination helper for on-demand pagination. The SDK response retains `meta.next_page` and related fields.

The loader supports the filters from the Are.na channel contents endpoint. Additional filtering belongs in Astro collection queries or application code.

Search uses the SDK. Are.na requires authentication and an eligible account for v3 search.

## Build Synchronization

Build-time loaders use Are.na ETags.

The loader metadata stores an ETag and a request fingerprint. The fingerprint contains the source, query, and local content options.

If the fingerprint is unchanged, the loader sends `If-None-Match`.

If Are.na returns `304 Not Modified`, the loader keeps the current store.

If a request fails, the loader keeps the current store. It clears and replaces the store only after a successful changed response.

Each stored entry includes a digest for efficient updates.

## Live Caching

The live loader returns `lastModified` values and Are.na cache tags.

The loader does not set a cache duration. The application controls route caching.

Cache documentation must warn against shared caching for private or user-specific content.

## Errors

The package exports `ArenaLoaderError` for loader-specific failures. The error retains the official SDK error as its cause.

Errors distinguish these conditions:

- Invalid source
- Authentication failure
- Forbidden resource
- Missing resource
- Rate limit
- Network failure
- Invalid response
- Schema failure

Error messages state the failed action and the next corrective action. They never include credentials.

## Package Structure

The repository uses:

- pnpm
- TypeScript
- tsup
- Vitest
- MSW
- Biome
- publint
- Are The Types Wrong

The npm package uses these properties:

- Name: `astro-arena`
- Initial version: `0.1.0`
- Module type: ESM
- License: MIT
- `sideEffects: false`
- Root and `./api` exports
- JavaScript, declarations, and source maps
- `withastro` and `astro-loader` keywords

The npm package contains `dist`, `docs`, `README.md`, `LICENSE`, and `package.json`.

The package metadata targets `jyoungblood/astro-arena`. Creating the remote repository is outside the initial implementation authority.

## Documentation

The README provides these sections:

- Installation
- Public channel quickstart
- Private channel quickstart
- Block loading
- Nested channels
- Rendering
- Live collections
- Custom SDK collections
- Troubleshooting
- Full documentation index

The `docs` directory contains focused guides for:

- Loader API
- Custom SDK collections
- Authentication and private content
- Pagination and filtering
- Live collections
- Data types and rendering
- Connection and resource metadata
- Images and accessibility
- Caching and rate limits
- Errors and troubleshooting
- Security and deployment

All technical documentation uses pragmatic Simplified Technical English. Each documentation slice includes the required self-check.

## Playground

The playground is a separate sibling repository:

`/Users/jy/Desktop/projects/astro-arena-playground`

It uses Astro 7 and the Node adapter. It links the local package until npm publication.

The playground includes:

- A static public channel page
- Static block detail pages
- A live channel page
- A custom SDK collection
- Optional private channel coverage
- An `.env.example` file without credentials

The default public source is [Arena Influences](https://www.are.na/are-na-team/arena-influences).

Automated verification uses command-line checks and builds. The user performs the visual inspection without browser automation.

## Test Strategy

Normal tests use MSW and do not contact Are.na.

The suite covers:

- URL, slug, and ID parsing
- Invalid hosts and resource mismatches
- Public and private authentication
- Token overrides and anonymous mode
- Secret safety
- Query forwarding
- One-page request enforcement
- Blocks-only and nested-channel output
- Entry IDs and original resource IDs
- All block types
- Connection and custom metadata
- Rendered HTML and body content
- ETag and fingerprint behavior
- Safe store replacement
- HTTP, network, rate-limit, and schema errors
- Live filters and filter precedence
- Live entries and missing entries
- Live cache hints
- Custom SDK collection examples
- Package exports
- Tarball contents

An opt-in smoke test uses a real public Are.na channel.

CI runs on Node.js 22 and 24. It checks the latest supported Astro 6 and Astro 7 releases.

The required commands include Biome, TypeScript, Vitest, package build, publint, Are The Types Wrong, and `npm pack`.

## Release Preparation

CI runs for branches and pull requests.

A GitHub Release workflow prepares npm trusted publishing with provenance.

The first implementation prepares version `0.1.0`. It does not publish the package.

Publishing, remote repository creation, and remote pushes require separate approval.

## Version 1 Exclusions

Version 1 does not include:

- Astro 5 support
- Automatic full-channel enumeration
- Polling
- Webhooks
- Image downloads
- Image transformation
- A client-side token flow
- Endpoint-specific loaders for every SDK resource
