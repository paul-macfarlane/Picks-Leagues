#!/usr/bin/env bash
# Pre-commit hook for Claude Code: runs `pnpm lint` and `pnpm typecheck`
# before allowing the model to run `git commit`. Exits 0 (skip) gracefully if:
#   - the Bash command isn't a commit
#   - jq isn't installed
#   - pnpm isn't installed yet
#   - the lint/typecheck scripts aren't defined in package.json
#
# Exits 2 (block) on actual lint/typecheck failures so the model fixes
# before retrying. The model is also instructed never to use --no-verify.

set -uo pipefail

input=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

cmd=$(echo "$input" | jq -r '.tool_input.command // ""')

# Only act on commands that include `git commit`. This catches `git commit ...`,
# `git commit -m ...`, `... && git commit ...`, etc. Heredocs in the message
# body won't trip a false positive because the actual `git commit` token
# still appears in the command string.
if ! echo "$cmd" | grep -qE '(^|[[:space:];&|])git[[:space:]]+commit([[:space:]]|$)'; then
  exit 0
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$repo_root" ] || [ ! -f "$repo_root/package.json" ]; then
  exit 0
fi

cd "$repo_root"

if ! command -v pnpm >/dev/null 2>&1; then
  exit 0
fi

has_lint=$(jq -r '.scripts.lint // empty' package.json 2>/dev/null)
has_typecheck=$(jq -r '.scripts.typecheck // empty' package.json 2>/dev/null)

if [ -n "$has_lint" ]; then
  if ! pnpm lint >/tmp/claude-pre-commit-lint.log 2>&1; then
    echo "pnpm lint failed. Fix the errors before committing — do not use --no-verify." >&2
    echo "" >&2
    tail -50 /tmp/claude-pre-commit-lint.log >&2
    exit 2
  fi
fi

if [ -n "$has_typecheck" ]; then
  if ! pnpm typecheck >/tmp/claude-pre-commit-typecheck.log 2>&1; then
    echo "pnpm typecheck failed. Fix the type errors before committing — do not use --no-verify." >&2
    echo "" >&2
    tail -50 /tmp/claude-pre-commit-typecheck.log >&2
    exit 2
  fi
fi

exit 0
