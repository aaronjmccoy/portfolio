#!/usr/bin/env bash
# LP-6: an agent must not weaken a check to make it pass.
# - Skipping git hooks is blocked outright.
# - Editing a file that defines a check asks the person first.
input=$(cat)

tool=$(printf '%s' "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ "$tool" = "Bash" ]; then
  if printf '%s' "$input" | grep -Eq -- '--no-verify|LEFTHOOK=0|LEFTHOOK_EXCLUDE=|SKIP=gitleaks|git commit[^"]* -n( |")'; then
    echo "Blocked (LP-6): this command skips the git hooks. Run it without skipping them, and fix whatever the hooks report." >&2
    exit 2
  fi
  exit 0
fi

# Edit, Write, MultiEdit: normalise the path (Windows paths arrive with escaped backslashes).
path=$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1 | sed 's#\\\\#/#g; s#\\#/#g')

case "$path" in
  */biome.json | */biome.jsonc | */tsconfig.strict.json | */vitest.config.* | \
  */lefthook.yml | */gdlintrc | */.theme-check.yml | \
  */.github/workflows/* | */scripts/check*.sh | \
  */.claude/settings.json | */.claude/hooks/*)
    reason="$path defines a check (LP-6). Changing it can hide a real problem. Approve only if the check itself is wrong."
    reason=${reason//\"/\'}
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"%s"}}\n' "$reason"
    exit 0
    ;;
esac
exit 0
