#!/bin/bash
set -euo pipefail

# Start the normal Docusaurus dev server plus the static HTML template watcher.
# This replaces the old package.json `cmd & docusaurus start` one-liner so all
# child processes are cleaned up reliably when Docusaurus exits or Ctrl+C is
# pressed.

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

node scripts/build-html.js --watch &
PIDS+=("$!")

docusaurus start &
PIDS+=("$!")
DOCUSAURUS_PID="$!"

# Wait on Docusaurus as the primary process. When it exits, the EXIT trap stops
# the template watcher too.
wait "$DOCUSAURUS_PID"
