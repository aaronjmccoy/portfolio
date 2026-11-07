export type CliArgs = {
  command: string | undefined;
  dryRun: boolean;
  catalogDir: string;
};

const DEFAULT_CATALOG_DIR = process.env['CATALOG_DIR'] || 'catalog';

/** Tiny, dependency-free argument parser for the handful of flags we need. */
export function parseArgs(argv: readonly string[]): CliArgs {
  const out: CliArgs = { command: undefined, dryRun: false, catalogDir: DEFAULT_CATALOG_DIR };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--catalog') {
      const v = argv[++i];
      if (!v) throw new Error('--catalog needs a directory');
      out.catalogDir = v;
    } else if (a?.startsWith('--catalog=')) out.catalogDir = a.slice('--catalog='.length);
    else if (a?.startsWith('-')) throw new Error(`unknown flag ${a}`);
    else if (out.command === undefined) out.command = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  return out;
}
