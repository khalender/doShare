#!/usr/bin/env bash
# Copy HTML files or folders into pages/, commit and push. GitHub Actions then publishes them.
# Usage: ./publish.sh [-d subfolder] FILE_OR_DIR...
set -euo pipefail
dest=pages
if [[ "${1:-}" == "-d" ]]; then dest="pages/$2"; shift 2; fi
[[ $# -gt 0 ]] || { echo "usage: $0 [-d subfolder] FILE_OR_DIR..." >&2; exit 1; }
srcs=(); for src in "$@"; do srcs+=("$(realpath "$src")"); done
cd "$(dirname "$(realpath "$0")")"
mkdir -p "$dest"
for src in "${srcs[@]}"; do cp -r "$src" "$dest/"; done
git add pages
git commit -m "Publish $(printf '%s ' "${srcs[@]##*/}")" || { echo "nothing changed"; exit 0; }
git push
repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
owner=${repo%%/*}; name=${repo##*/}
sub=${dest#pages}
for src in "${srcs[@]}"; do
  echo "https://${owner}.github.io/${name}${sub}/${src##*/}"
done
