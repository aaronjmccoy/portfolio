#!/usr/bin/env bash
# SC-1: scan staged changes for secrets before each commit. CI scans again.
set -euo pipefail

if ! command -v gitleaks >/dev/null 2>&1; then
  cat >&2 <<'EOF'
gitleaks is not installed, so secrets cannot be checked (SC-1).
Install it, then commit again:
  Windows: winget install Gitleaks.Gitleaks
  macOS:   brew install gitleaks
EOF
  exit 1
fi

gitleaks git --pre-commit --redact --staged --verbose
