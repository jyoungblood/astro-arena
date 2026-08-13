# Custom SDK collections

`arena.client()` returns the official Are.na SDK client. Use it inside `defineCollection()` for any v3 GET operation.

## Singleton response

This collection gets one user.

```ts
import { defineCollection } from "astro:content";
import { arena } from "astro-arena";

const client = arena.client();

const team = defineCollection({
  loader: async () => {
    const user = await client.users.get("are-na-team");
    return [{ id: `user:${user.id}`, resource: user }];
  },
});
```

## List response

This collection gets one page of followers.

```ts
const followers = defineCollection({
  loader: async () => {
    const page = await client.users.followers("are-na-team", { page: 1, per: 24 });
    return page.data.map((user) => ({
      id: `user:${user.id}`,
      resource: user,
    }));
  },
});
```

## Mixed-resource response

Search can return blocks, channels, users, and groups. Prefix each ID with the resource type.

```ts
const results = defineCollection({
  loader: async () => {
    const page = await client.search.query({ query: "visual research", page: 1 });
    return page.data.map((resource) => ({
      id: `${resource.type.toLowerCase()}:${resource.id}`,
      resource,
    }));
  },
});
```

The prefix prevents ID collisions in a mixed collection.

## Generated operations

Import generated operations and types from `astro-arena/api`.

```ts
import { getUser, type GetUserData } from "astro-arena/api";
```

These exports match `@aredotna/sdk/api`. Use `arena.client().client` as the generated operation client.

Custom collections do not get the specialized ETag, rendering, or normalized-error behavior.

## Available GET resources

The client groups v3 operations by Are.na resource.

- `client.blocks` gets blocks, connections, and comments.
- `client.channels` gets channels, contents, connections, and followers.
- `client.users` gets users, contents, followers, following resources, and groups.
- `client.groups` gets groups, contents, followers, members, invitations, and invite codes.
- `client.me.feed()` gets the authenticated feed.
- `client.me.notifications()` gets notifications for the authenticated user.
- `client.search.query()` searches resources for an eligible authenticated account.
- `client.connections` gets a connection.
- `client.ping()` gets the API health response.

The same client also contains write operations. Use the official SDK types to make sure that each call has valid input.

### Feed example

```ts
const feed = defineCollection({
  loader: async () => {
    const page = await client.me.feed({ limit: 24 });
    return page.data.map((item) => ({
      id: `activity:${item.id}`,
      resource: item,
    }));
  },
});
```

### Notifications example

```ts
const notifications = defineCollection({
  loader: async () => {
    const page = await client.me.notifications({ limit: 24 });
    return page.data.map((item) => ({
      id: `notification:${item.id}`,
      resource: item,
    }));
  },
});
```

Feed, notifications, and v3 search require authentication. Are.na can apply account-level requirements to search.

Use the [Are.na v3 API explorer](https://www.are.na/developers/explore) for the current endpoint contract.
