#!/bin/bash
set -euo pipefail

# Start the Docusaurus dev server plus the helper watchers used during local
# external-docs development. Keeping this in a script instead of a long
# package.json one-liner lets us clean up child processes reliably on Ctrl+C.

PIDS=()

cleanup() {
	if [ "${#PIDS[@]}" -gt 0 ]; then
		kill "${PIDS[@]}" 2>/dev/null || true
	fi
}

trap cleanup EXIT INT TERM

node scripts/build-html.js
bash scripts/import-external-docs.sh

node scripts/build-html.js --watch &
PIDS+=("$!")

bash scripts/import-external-docs.sh --watch &
PIDS+=("$!")

# Keep Docusaurus in the foreground. When it exits, or when Ctrl+C interrupts
# this script, the trap above stops the background watchers.
docusaurus start
