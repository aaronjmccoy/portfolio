export type CliArgs = {
  command: string | undefined;
  dryRun: boolean;
  configPath: string;
  stickerDir: string;
  only: string | undefined;
};

/** Tiny, dependency-free argument parser for the handful of flags we need. */
export function parseArgs(argv: readonly string[]): CliArgs {
  const out: CliArgs = {
    command: undefined,
    dryRun: false,
    configPath: 'derive.config.json',
    stickerDir: 'stickers',
    only: undefined,
  };
  const takeValue = (flag: string, i: number): string => {
    const v = argv[i];
    if (!v || v.startsWith('-')) throw new Error(`${flag} needs a value`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--config') out.configPath = takeValue(a, ++i);
    else if (a.startsWith('--config=')) out.configPath = a.slice('--config='.length);
    else if (a === '--stickers') out.stickerDir = takeValue(a, ++i);
    else if (a.startsWith('--stickers=')) out.stickerDir = a.slice('--stickers='.length);
    else if (a === '--only') out.only = takeValue(a, ++i);
    else if (a.startsWith('--only=')) out.only = a.slice('--only='.length);
    else if (a.startsWith('-')) throw new Error(`unknown flag ${a}`);
    else if (out.command === undefined) out.command = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  return out;
}
