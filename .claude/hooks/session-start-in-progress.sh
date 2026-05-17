#!/usr/bin/env bash
# Session start hook for Claude Code: surfaces any backlog tickets currently
# in IN_PROGRESS so the model picks up where work was left off.
# Output (if any) is injected as additional context.

set -uo pipefail

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$repo_root" ] || [ ! -d "$repo_root/docs/backlog" ]; then
  exit 0
fi

# Files that contain an IN_PROGRESS ticket
in_progress_files=$(grep -rl 'Status:\*\* IN_PROGRESS' "$repo_root/docs/backlog/" 2>/dev/null || true)

if [ -z "$in_progress_files" ]; then
  exit 0
fi

echo "## In-progress tickets (Status: IN_PROGRESS)"
echo ""
echo "These tickets were left in progress. If you're about to work on something else, consider whether one of these should be resumed first."
echo ""

for file in $in_progress_files; do
  rel=${file#"$repo_root/"}
  awk -v fname="$rel" '
    /^### [A-Z]+-[0-9]+/ { current=$0 }
    /\*\*Status:\*\* IN_PROGRESS/ {
      sub(/^### /, "", current)
      print "- " current " — " fname
    }
  ' "$file"
done

# Also surface any BLOCKED tickets
blocked_files=$(grep -rl 'Status:\*\* BLOCKED' "$repo_root/docs/backlog/" 2>/dev/null || true)
if [ -n "$blocked_files" ]; then
  echo ""
  echo "## Blocked tickets (Status: BLOCKED)"
  echo ""
  for file in $blocked_files; do
    rel=${file#"$repo_root/"}
    awk -v fname="$rel" '
      /^### [A-Z]+-[0-9]+/ { current=$0 }
      /\*\*Status:\*\* BLOCKED/ {
        sub(/^### /, "", current)
        print "- " current " — " fname
      }
    ' "$file"
  done
fi

exit 0
