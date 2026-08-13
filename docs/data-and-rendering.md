# Data and rendering

## Raw resource data

Each entry keeps the original object from the official Are.na SDK. The loader does not rename or flatten resource fields.

The retained data includes these fields when Are.na supplies them:

- Block type and content
- Connection position and pinned state
- Connection metadata
- Resource metadata
- Embedded user data
- Are.na links
- Resource abilities

Additive API fields also remain in the entry data.

## Block types

The schemas accept all current Are.na block types:

- `Text`
- `Image`
- `Link`
- `Attachment`
- `Embed`
- `PendingBlock`

Use `entry.data.type` to narrow the official SDK union.

```ts
if (entry.data.type === "Image") {
  console.log(entry.data.image.alt_text);
}
```

## Entry IDs

Specialized collections use these ID rules:

- A block with ID `123` uses `"123"`.
- A nested channel with ID `123` uses `"channel:123"`.

Use resource prefixes for custom mixed collections. Examples are `block:123`, `channel:123`, and `user:123`.

## Body and rendered HTML

A text block uses `content.markdown` for `body`. It uses `content.html` for `rendered.html`.

Another resource uses its description when a description exists. Astro can render these fields with `render()`.

```astro
---
import { render } from "astro:content";

const { Content } = await render(entry);
---

<Content />
```

The package uses the HTML that Are.na supplies. Sanitize this HTML in the application if the source is not trusted.

## Images

The package does not download or transform Are.na images. An image block keeps all image variants and `alt_text`.

Select a suitable image variant for the page. Use `alt_text` for the image description when it exists.

```astro
<img src={entry.data.image.large.src} alt={entry.data.image.alt_text ?? ""} />
```

Configure Astro remote-image access if an Astro image component processes the Are.na URL.

## Custom schemas

The package schemas are permissive and use official SDK types. A schema in `defineCollection()` has priority over the loader schema.

If you add a custom schema, include every field that the application needs. A strict schema can remove unknown additive fields.
