#!/usr/bin/env bash
# CQ-1: the one check command. CI, the Claude Stop hook and people all run it.
# Done means this passes (LP-5).
set -euo pipefail
cd "$(dirname "$0")/.."

# Which files Biome checks: "all", or "changed" (only files that differ from main).
# A repo with existing lint errors uses "changed" until they are fixed, then "all".
lint_scope=changed

on_fail() {
  cat >&2 <<'EOF'

check failed. Fix the code so the check passes.
Do not raise limits, skip or delete tests, add ignores, or use --no-verify (LP-6).
If the check itself is wrong, stop and ask the person, with options and a recommendation (WR-4).
EOF
}
trap on_fail ERR

step() { printf '\n== %s\n' "$1"; }

pm=npm
if [ -f pnpm-lock.yaml ]; then pm=pnpm; elif [ -f yarn.lock ]; then pm=yarn; fi

# Run a dev dependency from node_modules. Never `npx <name>`: when the package
# is not installed, npx downloads whatever package has that name and runs it.
bin() {
  local tool=$1
  shift
  if [ ! -e "node_modules/.bin/$tool" ]; then
    echo "$tool is not installed. Run: $pm install" >&2
    return 1
  fi
  "node_modules/.bin/$tool" "$@"
}

has_script() {
  node -e 'process.exit(require("./package.json").scripts?.[process.argv[1]] ? 0 : 1)' "$1"
}

step "repo files (AG-1, AG-3)"
bash scripts/check-repo.sh

step "format and lint (CQ-2, CQ-3, CQ-5, TS-2)"
if [ "$lint_scope" = changed ]; then
  base=main
  if git rev-parse --verify --quiet origin/main >/dev/null; then base=origin/main; fi
  # Committed, uncommitted and new files. Biome's own --changed misses the last two.
  mapfile -t files < <(
    git diff --name-only --diff-filter=d "$(git merge-base "$base" HEAD)"
    git ls-files --others --exclude-standard
  )
  echo "lint_scope=changed: checking ${#files[@]} files changed since $base"
  if [ "${#files[@]}" -gt 0 ]; then
    bin biome ci --no-errors-on-unmatched --files-ignore-unknown=true "${files[@]}"
  fi
else
  bin biome ci .
fi
if has_script lint; then
  "$pm" run lint
fi

step "typecheck (CQ-5)"
if has_script typecheck; then
  "$pm" run typecheck
else
  bin tsc --noEmit
fi

step "tests (TS-1 to TS-6)"
bin vitest run --coverage

if has_script build; then
  step "build"
  "$pm" run build
fi

printf '\ncheck passed\n'
