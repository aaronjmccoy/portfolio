/**
 * derive.config.json: the one table Megan and Aaron set once. Which collection holds
 * the originals, which sales channel to publish to, and what a print and a sticker are.
 */
export type SizeSpec = { name: string; price: string; weightOz: number };

export type DeriveConfig = {
  originals: { collection: string };
  publication: string;
  prints: {
    collection: string;
    titleSuffix: string;
    option: string;
    sizes: SizeSpec[];
    /** HTML; `{title}` is replaced with the original's title. */
    descriptionHtml: string;
  };
  stickers: {
    collection: string;
    titleSuffix: string;
    price: string;
    weightOz: number;
    descriptionHtml: string;
  };
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const MONEY = /^\d+\.\d{2}$/;

function fail(path: string, msg: string): never {
  throw new Error(`derive config: ${path} ${msg}`);
}
function str(o: Record<string, unknown>, k: string, path: string): string {
  const v = o[k];
  if (typeof v !== 'string' || v.length === 0) fail(`${path}.${k}`, 'must be a non-empty string');
  return v;
}
function money(o: Record<string, unknown>, k: string, path: string): string {
  const v = str(o, k, path);
  if (!MONEY.test(v)) fail(`${path}.${k}`, 'must be a price like "35.00"');
  return v;
}
function ounces(o: Record<string, unknown>, k: string, path: string): number {
  const v = o[k];
  if (typeof v !== 'number' || !(v > 0)) fail(`${path}.${k}`, 'must be a positive number of ounces');
  return v;
}
function section(o: Record<string, unknown>, k: string): Record<string, unknown> {
  const v = o[k];
  if (!isRecord(v)) fail(k, 'must be an object');
  return v;
}

/** Validates the parsed JSON and returns a typed config, or throws naming the bad field. */
export function parseConfig(raw: unknown): DeriveConfig {
  if (!isRecord(raw)) fail('root', 'must be an object');
  const originals = section(raw, 'originals');
  const prints = section(raw, 'prints');
  const stickers = section(raw, 'stickers');
  const sizesRaw = prints['sizes'];
  if (!Array.isArray(sizesRaw) || sizesRaw.length === 0) fail('prints.sizes', 'must be a non-empty array');
  const sizes = sizesRaw.map((s, i): SizeSpec => {
    const path = `prints.sizes[${i}]`;
    if (!isRecord(s)) fail(path, 'must be an object');
    return { name: str(s, 'name', path), price: money(s, 'price', path), weightOz: ounces(s, 'weightOz', path) };
  });
  const names = new Set(sizes.map((s) => s.name));
  if (names.size !== sizes.length) fail('prints.sizes', 'has duplicate size names');
  return {
    originals: { collection: str(originals, 'collection', 'originals') },
    publication: str(raw, 'publication', 'root'),
    prints: {
      collection: str(prints, 'collection', 'prints'),
      titleSuffix: str(prints, 'titleSuffix', 'prints'),
      option: str(prints, 'option', 'prints'),
      sizes,
      descriptionHtml: str(prints, 'descriptionHtml', 'prints'),
    },
    stickers: {
      collection: str(stickers, 'collection', 'stickers'),
      titleSuffix: str(stickers, 'titleSuffix', 'stickers'),
      price: money(stickers, 'price', 'stickers'),
      weightOz: ounces(stickers, 'weightOz', 'stickers'),
      descriptionHtml: str(stickers, 'descriptionHtml', 'stickers'),
    },
  };
}
