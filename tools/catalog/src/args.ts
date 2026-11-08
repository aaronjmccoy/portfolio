export type CliArgs = {
  command: string | undefined;
  dryRun: boolean;
  configPath: string;
  stickerDir: string;
  /** originals: the folder of photographs */
  dir: string | undefined;
  /** originals: file stems to ignore (site art, icons) */
  skip: string[];
  only: string | undefined;
};

/** Tiny, dependency-free argument parser for the handful of flags we need. */
export function parseArgs(argv: readonly string[]): CliArgs {
  const out: CliArgs = {
    command: undefined,
    dryRun: false,
    configPath: 'derive.config.json',
    stickerDir: 'stickers',
    dir: undefined,
    skip: [],
    only: undefined,
  };
  const takeValue = (flag: string, i: number): string => {
    const v = argv[i];
    if (!v || v.startsWith('-')) throw new Error(`${flag} needs a value`);
    return v;
  };
  const valued: Record<string, (v: string) => void> = {
    '--config': (v) => void (out.configPath = v),
    '--stickers': (v) => void (out.stickerDir = v),
    '--dir': (v) => void (out.dir = v),
    '--skip': (v) => void out.skip.push(...v.split(',').map((s) => s.trim()).filter(Boolean)),
    '--only': (v) => void (out.only = v),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    const eq = a.indexOf('=');
    const flag = eq > 0 ? a.slice(0, eq) : a;
    const setter = valued[flag];
    if (a === '--dry-run') out.dryRun = true;
    else if (setter) setter(eq > 0 ? a.slice(eq + 1) : takeValue(flag, ++i));
    else if (a.startsWith('-')) throw new Error(`unknown flag ${a}`);
    else if (out.command === undefined) out.command = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  return out;
}
