# Loader API

The `arena` namespace contains three specialized loaders and the complete SDK client.

## `arena.channel()`

This loader gets one page from a channel contents endpoint.

```ts
arena.channel({
  url: "https://www.are.na/are-na-team/arena-influences",
  query: { page: 1, per: 24, sort: "position_desc" },
  includeChannels: false,
});
```

Supply one of these source properties:

- `url`: An Are.na web URL, an API URL, a slug, or a numeric ID.
- `id`: A slug or a numeric ID.

These additional properties control the request:

- `query`: Parameters for the channel contents endpoint.
- `includeChannels`: Keep nested channels when the value is `true`.
- `token`: A token, a token function, or `false`.
- `baseUrl`, `fetch`, `headers`, `retry`, and `userAgent`: Official SDK client configuration.

The loader forwards query parameters without changes. It gets blocks only by default.

Astro does not keep the response order in a build-time collection. Read [Build-time collection order](pagination-and-filters.md#build-time-collection-order).

## `arena.block()`

This loader gets one complete block.

```ts
arena.block({ id: 45029519 });
```

Supply `id` or `url`. A block ID must be a positive number.

The loader accepts the same SDK client configuration as `arena.channel()`.

## `arena.liveChannel()`

This loader gets channel data during a server request.

```ts
arena.liveChannel({
  id: "arena-influences",
  query: { page: 1, per: 24 },
});
```

It accepts the channel loader inputs. It does not use ETags or a cache duration.

Read [Live collections](live-collections.md) before you add this loader.

## Loader schemas

The package exports these permissive schemas:

- `arenaBlockSchema`
- `arenaChannelSchema`
- `arenaEntrySchema`

Official SDK types supply compile-time data types. The runtime schemas permit new additive API fields.

If `defineCollection()` has a schema, Astro uses that schema instead of the loader schema.
