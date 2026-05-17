#!/usr/bin/env bash
# Pre-push hook for Claude Code: blocks `git push` commands that would
# push directly to main, and refuses any `--force` / `--force-with-lease`
# against main. Other pushes (feature branches) pass through unchanged.
#
# Triggered on Bash tool calls; exits 2 to block when the push targets main,
# else exits 0.

set -uo pipefail

input=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

cmd=$(echo "$input" | jq -r '.tool_input.command // ""')

# Only act on git push commands
if ! echo "$cmd" | grep -qE '(^|[[:space:];&|])git[[:space:]]+push([[:space:]]|$)'; then
  exit 0
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$repo_root" ]; then
  exit 0
fi
cd "$repo_root"

current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

# Detect "targets main":
# - explicit `... main` or `... main:main` or `HEAD:main` as a refspec
# - OR `git push` with no refspec while on the main branch
explicit_main=false
if echo "$cmd" | grep -qE '[[:space:]](main|HEAD:main|main:main)([[:space:]]|$)'; then
  explicit_main=true
fi

implicit_main=false
# Match `git push` or `git push origin` (no refspec) while on main
if [ "$current_branch" = "main" ]; then
  if echo "$cmd" | grep -qE '(^|[[:space:];&|])git[[:space:]]+push([[:space:]]+[A-Za-z0-9_\-]+)?[[:space:]]*($|;|&|\|)'; then
    implicit_main=true
  fi
fi

force_flag=false
if echo "$cmd" | grep -qE '(^|[[:space:]])(--force|-f|--force-with-lease)([[:space:]=]|$)'; then
  force_flag=true
fi

if $explicit_main || $implicit_main; then
  if $force_flag; then
    echo "Refusing to force-push to main. Force-pushing main destroys history; if you genuinely need this, the human should do it manually." >&2
  else
    echo "Refusing to push directly to main. Push the feature branch instead and open a PR (gh pr create)." >&2
  fi
  exit 2
fi

exit 0
