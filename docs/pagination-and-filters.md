# Pagination and filters

## Specialized channel loader

`arena.channel()` gets one page for each content synchronization. It never gets all channel pages automatically.

Set the page and size in the query.

```ts
const references = defineCollection({
  loader: arena.channel({
    id: "arena-influences",
    query: { page: 2, per: 50 },
  }),
});
```

Are.na accepts a maximum value of 100 for `per`.

The channel contents endpoint currently supports these query properties:

- `page`: Selects the page number.
- `per`: Sets the number of items on the page.
- `sort`: Sets the Are.na channel-content order.
- `user_id`: Selects content that a user connected.

The loader forwards additional query properties. This behavior supports additive Are.na API changes.

## Explicit SDK pagination

Use the SDK iterator when an application must get more than one page.

```ts
const client = arena.client();

for await (const page of client.channels.paginateContents("arena-influences", {
  per: 50,
})) {
  for (const resource of page.data) {
    console.log(resource.id);
  }
}
```

This iterator can request every page. Stop the loop when the application has enough data.

Each list response keeps the Are.na `meta` object. This object contains page counts and next-page data.

## Live query filters

`getLiveCollection()` can supply query values at request time.

```ts
const { entries, error } = await getLiveCollection("references", {
  page: 2,
  per: 24,
});
```

Runtime values have priority over values in `arena.liveChannel()`. The live loader also gets only one page per call.

## Application filters

Use an Astro collection filter or array method for conditions that the endpoint does not support.

```ts
const images = await getCollection("references", ({ data }) => data.type === "Image");
```

Application filters run after the loader gets the requested page.
