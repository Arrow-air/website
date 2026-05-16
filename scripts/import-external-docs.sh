#!/bin/bash
set -euo pipefail

WATCH_MODE=0
if [ "${1:-}" = "--watch" ]; then
	WATCH_MODE=1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

CONFIG_FILE="$PROJECT_ROOT/external-docs.json"

if [ ! -f "$CONFIG_FILE" ]; then
	echo "Error: Config file not found: $CONFIG_FILE"
	exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
	echo "Error: jq is required but not installed. Install with: brew install jq (macOS) or apt-get install jq (Linux)"
	exit 1
fi

# sed -i differs between macOS and Linux. Keep this as a function so the
# empty macOS backup suffix is passed as a real empty argument, not the
# literal string '' (which creates stray backup files named *.md'').
sed_inplace() {
	if [[ "$OSTYPE" == "darwin"* ]]; then
		sed -i '' "$@"
	else
		sed -i "$@"
	fi
}

local_env_name() {
	echo "EXTERNAL_DOCS_LOCAL_$1" | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9_]/_/g'
}

local_source_for_key() {
	local key="$1"
	local env_name
	env_name="$(local_env_name "$key")"
	local env_value="${!env_name:-}"

	if [ -n "$env_value" ]; then
		echo "$env_value"
		return
	fi

	jq -r ".\"$key\".localPath // \"\"" "$CONFIG_FILE"
}

resolved_docs_source() {
	local configured_path="$1"
	local docs_path="$2"

	if [ -d "$configured_path/$docs_path" ]; then
		echo "$configured_path/$docs_path"
	elif [ -d "$configured_path" ]; then
		echo "$configured_path"
	else
		echo "Error: Local docs path does not exist: $configured_path" >&2
		return 1
	fi
}

source_fingerprint() {
	local source_dir="$1"
	# Content-hash only files that participate in the import. This is portable and
	# avoids requiring fswatch/inotifywait for local development.
	find "$source_dir" -type f \
		! -name '.DS_Store' \
		! -name 'mkdocs.yaml' \
		! -name 'mkdocs.yml' \
		-exec shasum {} + 2>/dev/null | sort | shasum | awk '{print $1}'
}

import_key() {
	local key="$1"
	local repo branch docs_path sidebar_label sidebar_position target_path
	repo=$(jq -r ".\"$key\".repo" "$CONFIG_FILE")
	branch=$(jq -r ".\"$key\".branch // \"main\"" "$CONFIG_FILE")
	docs_path=$(jq -r ".\"$key\".docsPath // \"docs\"" "$CONFIG_FILE")
	sidebar_label=$(jq -r ".\"$key\".sidebarLabel // \"$key\"" "$CONFIG_FILE")
	sidebar_position=$(jq -r ".\"$key\".sidebarPosition // 99" "$CONFIG_FILE")
	target_path=$(jq -r ".\"$key\".targetPath // \"docs/$key\"" "$CONFIG_FILE")

	local configured_local_source source_dir tmp_dir
	configured_local_source="$(local_source_for_key "$key")"
	tmp_dir=""

	if [ -n "$configured_local_source" ]; then
		source_dir="$(resolved_docs_source "$configured_local_source" "$docs_path")"
		echo "Importing docs from local path $source_dir..."
	else
		echo "Importing docs from $repo ($branch)..."

		# Create temp dir and clone with sparse checkout
		tmp_dir=$(mktemp -d)
		git clone --depth 1 --branch "$branch" --filter=blob:none --sparse \
			"https://github.com/$repo.git" "$tmp_dir"

		cd "$tmp_dir"
		git sparse-checkout set "$docs_path"
		cd "$PROJECT_ROOT"
		source_dir="$tmp_dir/$docs_path"
	fi

	# Remove old docs and create fresh target directory
	rm -rf "$target_path"
	mkdir -p "$target_path"

	# Copy everything except excluded files
	rsync -av --exclude='.DS_Store' --exclude='mkdocs.yaml' --exclude='mkdocs.yml' \
		"$source_dir/" "$target_path/"

	# Fix MDX compatibility issues in markdown files
	echo "  Fixing MDX compatibility..."

	find "$target_path" -name "*.md" -type f | while read -r mdfile; do
		sed_inplace \
			-e 's/<br>/<br\/>/g' \
			-e 's/<hr>/<hr\/>/g' \
			-e 's/<img \([^>]*[^/]\)>/<img \1 \/>/g' \
			"$mdfile"
	done

	# Move HTML files to static folder (Docusaurus serves these as-is)
	# Put under static/docs/ so URLs match the /docs/... path
	local static_path
	static_path="static/docs/$key"

	# Clean up old static folder
	rm -rf "$static_path"

	echo "  Moving HTML files to static folder..."
	mkdir -p "$static_path"

	# Find and move HTML files, preserving directory structure
	find "$target_path" -name "*.html" -type f | while read -r html_file; do
		local rel_path rel_dir
		rel_path="${html_file#$target_path/}"
		rel_dir=$(dirname "$rel_path")

		mkdir -p "$static_path/$rel_dir"
		mv "$html_file" "$static_path/$rel_path"
		echo "    Moved: $rel_path -> $static_path/$rel_path"
	done

	# Update links in markdown files to point to static folder
	echo "  Updating HTML links in markdown files..."
	find "$target_path" \( -name "*.md" -o -name "*.mdx" \) -type f | while read -r mdfile; do
		local md_rel_dir
		md_rel_dir=$(dirname "${mdfile#$target_path/}")

		sed_inplace \
			-e "s|\./assets/\([^)]*\.html\)|pathname:///docs/$key/$md_rel_dir/assets/\1|g" \
			"$mdfile" 2>/dev/null || true
	done

	# Docusaurus processes Markdown image syntax into hashed build assets, but
	# raw HTML <img src="..."> tags and links to binary assets keep their
	# relative URLs. Mirror imported non-doc assets under the public route so
	# those relative URLs resolve on the deployed site.
	local route_base asset_static_path
	route_base=$(jq -r ".\"$key\".routeBasePath // empty" "$CONFIG_FILE")
	if [ -z "$route_base" ]; then
		if [ "$key" = "project-quiver" ]; then
			route_base="quiver"
		else
			route_base="$key"
		fi
	fi

	asset_static_path="static/$route_base"
	echo "  Mirroring static assets to /$route_base/..."
	rm -rf "$asset_static_path"
	mkdir -p "$asset_static_path"
	rsync -a \
		--exclude='*.md' \
		--exclude='*.mdx' \
		--exclude='_category_.json' \
		--exclude='.DS_Store' \
		"$target_path/" "$asset_static_path/"

	# Patch known upstream links that do not resolve cleanly in the website's
	# Docusaurus route structure after import.
	if [ "$key" = "project-quiver" ] && [ -f "$target_path/index.md" ]; then
		# Engineering-Reports/_category_.json sets label "Reference / Engineering Reports",
		# which Docusaurus slugifies to /quiver/category/reference--engineering-reports/.
		sed_inplace \
			-e 's|\[Engineering Reports\](\./Engineering-Reports/)|[Engineering Reports](/quiver/category/reference--engineering-reports/)|g' \
			"$target_path/index.md" 2>/dev/null || true
	fi

	# Create _category_.json for sidebar only when importing into the default docs/ subfolder
	# (not needed for top-level plugin roots specified via targetPath)
	local custom_target
	custom_target=$(jq -r ".\"$key\".targetPath // \"\"" "$CONFIG_FILE")
	if [ -z "$custom_target" ] && [ ! -f "$target_path/_category_.json" ]; then
		if [ -f "$target_path/index.md" ] || [ -f "$target_path/index.mdx" ]; then
			cat > "$target_path/_category_.json" << EOF
{
	"label": "${sidebar_label}",
	"position": ${sidebar_position},
	"collapsible": false,
	"collapsed": false,
	"link": {
		"type": "doc",
		"id": "${key}/index"
	}
}
EOF
			echo "  Created _category_.json (linked to index doc)"
		else
			cat > "$target_path/_category_.json" << EOF
{
	"label": "${sidebar_label}",
	"position": ${sidebar_position},
	"collapsible": false,
	"collapsed": false,
	"link": {
		"type": "generated-index",
		"description": "Documentation for ${sidebar_label}"
	}
}
EOF
			echo "  Created _category_.json (generated index)"
		fi
	fi

	# Cleanup
	if [ -n "$tmp_dir" ]; then
		rm -rf "$tmp_dir"
	fi

	echo "✓ Imported $repo -> $target_path"
}

run_import() {
	for key in $(jq -r 'keys[]' "$CONFIG_FILE"); do
		import_key "$key"
	done

	echo ""
	echo "All external docs imported successfully"
}

run_import

if [ "$WATCH_MODE" -eq 1 ]; then
	WATCH_KEYS=()
	WATCH_SOURCES=()
	WATCH_FINGERPRINTS=()

	for key in $(jq -r 'keys[]' "$CONFIG_FILE"); do
		configured_local_source="$(local_source_for_key "$key")"
		if [ -n "$configured_local_source" ]; then
			docs_path=$(jq -r ".\"$key\".docsPath // \"docs\"" "$CONFIG_FILE")
			source_dir="$(resolved_docs_source "$configured_local_source" "$docs_path")"
			WATCH_KEYS+=("$key")
			WATCH_SOURCES+=("$source_dir")
			WATCH_FINGERPRINTS+=("$(source_fingerprint "$source_dir")")
		fi
	done

	if [ "${#WATCH_KEYS[@]}" -eq 0 ]; then
		echo ""
		echo "No local external docs configured; --watch has nothing to monitor."
		echo "Set EXTERNAL_DOCS_LOCAL_PROJECT_QUIVER=/path/to/project-quiver or /path/to/project-quiver/docs."
		exit 0
	fi

	interval="${EXTERNAL_DOCS_WATCH_INTERVAL:-2}"
	echo ""
	echo "Watching local external docs for changes every ${interval}s..."

	while true; do
		sleep "$interval"
		for index in "${!WATCH_KEYS[@]}"; do
			key="${WATCH_KEYS[$index]}"
			source_dir="${WATCH_SOURCES[$index]}"
			new_fingerprint="$(source_fingerprint "$source_dir")"
			if [ "$new_fingerprint" != "${WATCH_FINGERPRINTS[$index]}" ]; then
				echo ""
				echo "Change detected in $source_dir; re-importing $key..."
				import_key "$key"
				WATCH_FINGERPRINTS[$index]="$new_fingerprint"
			fi
		done
	done
fi
