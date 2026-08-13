import type { LoaderContext } from "astro/loaders";

export function createLoaderContext(initialEntries: Array<Record<string, unknown>> = []) {
  const entries = new Map(initialEntries.map((entry) => [String(entry.id), entry]));
  const metadata = new Map<string, string>();
  const context = {
    collection: "fixtures",
    config: {},
    generateDigest: (data: Record<string, unknown> | string) =>
      JSON.stringify(data).length.toString(16),
    logger: { debug() {}, error() {}, info() {}, warn() {} },
    meta: {
      delete: (key: string) => metadata.delete(key),
      get: (key: string) => metadata.get(key),
      has: (key: string) => metadata.has(key),
      set: (key: string, value: string) => metadata.set(key, value),
    },
    parseData: async <TData extends Record<string, unknown>>({ data }: { data: TData }) => data,
    renderMarkdown: async (content: string) => ({ html: content }),
    store: {
      addModuleImport() {},
      clear: () => entries.clear(),
      delete: (key: string) => entries.delete(key),
      entries: () => [...entries.entries()],
      get: (key: string) => entries.get(key),
      has: (key: string) => entries.has(key),
      keys: () => [...entries.keys()],
      set: (entry: { id: string }) => {
        entries.set(entry.id, entry as unknown as Record<string, unknown>);
        return true;
      },
      values: () => [...entries.values()],
    },
  } as unknown as LoaderContext;

  return { context, entries, metadata };
}
