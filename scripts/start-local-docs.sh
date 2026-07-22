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

handle_signal() {
	cleanup
	exit 130
}

trap cleanup EXIT
trap handle_signal INT TERM

node scripts/build-html.js
bash scripts/import-external-docs.sh

node scripts/build-html.js --watch &
PIDS+=("$!")

bash scripts/import-external-docs.sh --watch &
PIDS+=("$!")

docusaurus start &
PIDS+=("$!")
DOCUSAURUS_PID="$!"

# Wait on Docusaurus as the primary process. When it exits, the EXIT trap stops
# both background watchers too.
wait "$DOCUSAURUS_PID"
