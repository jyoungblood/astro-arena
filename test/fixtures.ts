import type { Block, Channel } from "@aredotna/sdk";

const markdown = {
  markdown: "A **description**",
  html: "<p>A <strong>description</strong></p>",
  plain: "A description",
};

const baseBlock = {
  id: 101,
  base_type: "Block",
  title: "Fixture block",
  description: markdown,
  state: "available",
  visibility: "public",
  comment_count: 0,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
  user: { id: 1, type: "User", name: "Fixture", slug: "fixture", avatar: null },
  metadata: { fixture: true },
  _links: { self: { href: "https://api.are.na/v3/blocks/101" } },
  connection: { id: 9, position: 3, pinned: true, metadata: { note: "keep" } },
};

export function blockFixture(type: Block["type"], extra: Record<string, unknown> = {}): Block {
  const variants: Record<Block["type"], Record<string, unknown>> = {
    Text: {
      content: {
        markdown: "Hello **Arena**",
        html: "<p>Hello <strong>Arena</strong></p>",
        plain: "Hello Arena",
      },
    },
    Image: {
      image: { alt_text: "A fixture image", large: { url: "https://example.test/image.jpg" } },
    },
    Link: { source: { url: "https://example.test", title: "Example" } },
    Attachment: { attachment: { url: "https://example.test/file.pdf", file_name: "file.pdf" } },
    Embed: { embed: { html: "<iframe></iframe>" } },
    PendingBlock: {},
  };

  return { ...baseBlock, type, ...variants[type], ...extra } as unknown as Block;
}

export function channelFixture(extra: Record<string, unknown> = {}): Channel {
  return {
    id: 101,
    type: "Channel",
    slug: "fixture-channel",
    title: "Fixture channel",
    description: markdown,
    state: "open",
    visibility: "public",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    metadata: { fixture: true },
    owner: { id: 1, type: "User", name: "Fixture", slug: "fixture", avatar: null },
    counts: { contents: 1, followers: 0, connections: 0 },
    _links: { self: { href: "https://api.are.na/v3/channels/101" } },
    connection: { id: 10, position: 4, pinned: false, metadata: { note: "nested" } },
    ...extra,
  } as unknown as Channel;
}
