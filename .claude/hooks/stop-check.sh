#!/usr/bin/env bash
# LP-5: Claude may stop only when scripts/check.sh passes.
# Exit 2 sends the failure back to Claude, which keeps working.
input=$(cat)

# If this stop already follows a blocked stop, let Claude stop and report
# the failure, rather than looping (Claude Code sets stop_hook_active).
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f scripts/check.sh ] || exit 0

# Nothing changed since the last commit, and the commit hooks already ran.
[ -n "$(git status --porcelain 2>/dev/null)" ] || exit 0

if ! output=$(bash scripts/check.sh 2>&1); then
  {
    echo "scripts/check.sh failed, so the task is not done (LP-5)."
    echo "Fix the cause and run it again. Do not weaken the check (LP-6)."
    echo "If you cannot fix it, say so in your report: what fails and why (WR-3)."
    echo "--- last 40 lines of output ---"
    # Strip colour codes and terminal links so Claude reads plain text.
    printf '%s\n' "$output" | sed $'s/\x1b\\[[0-9;]*m//g; s/\x1b]8;;[^\x1b]*\x1b\\\\//g' | tail -n 40
  } >&2
  exit 2
fi
exit 0
