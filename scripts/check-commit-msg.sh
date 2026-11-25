#!/usr/bin/env bash
# VC-1: commit messages follow Conventional Commits (https://www.conventionalcommits.org).
# lefthook runs this as the commit-msg hook: bash scripts/check-commit-msg.sh <message-file>
set -euo pipefail

subject=$(head -n 1 "$1" | tr -d '\r')

# Messages git writes itself are allowed.
case "$subject" in
  "Merge "* | "Revert \""* | "fixup! "* | "squash! "* | "amend! "*) exit 0 ;;
esac

types='feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert'
if printf '%s' "$subject" | grep -Eq "^($types)(\([a-z0-9._/-]+\))?!?: [^ ].*"; then
  if [ "${#subject}" -gt 72 ]; then
    echo "Commit subject is ${#subject} characters. Keep it to 72 or fewer; put detail in the body." >&2
    exit 1
  fi
  exit 0
fi

cat >&2 <<EOF
Commit message does not follow Conventional Commits (VC-1):
  $subject

Write it as: <type>(<optional scope>): <what changed, imperative mood>
  types: ${types//|/, }
  examples: "fix: reject expired tokens", "feat(cart): add discount codes"
Add "!" before the colon for a breaking change, as in "feat!: drop Node 20".
EOF
exit 1
