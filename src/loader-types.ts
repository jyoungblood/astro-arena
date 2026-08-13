export interface ArenaLoaderStore {
  clear(): void;
  set(entry: {
    id: string;
    data: Record<string, unknown>;
    body?: string;
    digest?: number | string;
    rendered?: { html: string };
  }): boolean;
}

export interface ArenaLoaderMeta {
  delete(key: string): void;
  get(key: string): string | undefined;
  has(key: string): boolean;
  set(key: string, value: string): void;
}

export interface ArenaLoaderContext {
  generateDigest(data: Record<string, unknown> | string): string;
  logger: {
    debug(message: string): void;
    info(message: string): void;
  };
  meta: ArenaLoaderMeta;
  parseData<TData extends Record<string, unknown>>(options: {
    id: string;
    data: TData;
  }): Promise<TData>;
  store: ArenaLoaderStore;
}

export interface ArenaStaticLoader<TSchema> {
  name: string;
  schema: TSchema;
  load(context: ArenaLoaderContext): Promise<void>;
}

export interface ArenaCacheHint {
  tags?: Array<string>;
  lastModified?: Date;
}

export interface ArenaLiveDataEntry<TData extends object> {
  id: string;
  data: TData;
  rendered?: { html: string };
  cacheHint?: ArenaCacheHint;
}

export interface ArenaLiveLoader<
  TData extends object,
  TEntryFilter extends Record<string, unknown>,
  TCollectionFilter extends Record<string, unknown>,
  TError extends Error,
> {
  name: string;
  loadEntry(context: {
    collection: string;
    filter: TEntryFilter;
  }): Promise<ArenaLiveDataEntry<TData> | undefined | { error: TError }>;
  loadCollection(context: {
    collection: string;
    filter?: TCollectionFilter;
  }): Promise<
    { entries: Array<ArenaLiveDataEntry<TData>>; cacheHint?: ArenaCacheHint } | { error: TError }
  >;
}
