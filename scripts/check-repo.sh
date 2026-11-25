#!/usr/bin/env bash
# AG-1, AG-3: the repo's agent files stay short and point to one source.
# scripts/check.sh runs this first.
set -euo pipefail

fail=0

if [ ! -f AGENTS.md ]; then
  echo "AGENTS.md is missing (AG-1). Copy agent-vault/Templates/AGENTS.md to the repo root and fill it in." >&2
  fail=1
else
  lines=$(wc -l < AGENTS.md | tr -d ' ')
  if [ "$lines" -gt 100 ]; then
    echo "AGENTS.md has $lines lines; the limit is 100 (AG-1). Cut overviews, file trees and anything an agent can read from the code (AG-2), or move a procedure into a skill (AG-5)." >&2
    fail=1
  fi
fi

if [ -f CLAUDE.md ] && ! grep -q '^@AGENTS.md' CLAUDE.md; then
  echo "CLAUDE.md must start with a line '@AGENTS.md' and hold only lines specific to Claude (AG-3)." >&2
  fail=1
fi

exit "$fail"
