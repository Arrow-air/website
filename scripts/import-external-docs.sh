#!/bin/bash
set -euo pipefail

# Import documentation from external repos into this Docusaurus site.
#
# Normal website builds clone the configured GitHub repo/branch from
# external-docs.json, copy its docs into this repo, then let Docusaurus build
# the copied files.
#
# Local development can skip the GitHub clone and copy from a local checkout:
#
#   EXTERNAL_DOCS_LOCAL_PROJECT_QUIVER=/path/to/project-quiver \
#     bash scripts/import-external-docs.sh --watch
#
# The environment variable name is generated from the external-docs.json key:
# project-quiver -> EXTERNAL_DOCS_LOCAL_PROJECT_QUIVER.

WATCH_MODE=0
if [ "${1:-}" = "--watch" ]; then
	WATCH_MODE=1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/external-docs.json"

cd "$PROJECT_ROOT"

if [ ! -f "$CONFIG_FILE" ]; then
	echo "Error: Config file not found: $CONFIG_FILE"
	exit 1
fi

if ! command -v jq &> /dev/null; then
	echo "Error: jq is required but not installed. Install with: brew install jq (macOS) or apt-get install jq (Linux)"
	exit 1
fi

# macOS and Linux spell in-place sed differently. Hiding that here keeps the
# actual import steps readable.
sed_inplace() {
	if [[ "$OSTYPE" == "darwin"* ]]; then
		sed -i '' "$@"
	else
		sed -i "$@"
	fi
}

# Convert a docs key like "project-quiver" into an env var name like
# "EXTERNAL_DOCS_LOCAL_PROJECT_QUIVER".
local_env_name() {
	echo "EXTERNAL_DOCS_LOCAL_$1" | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9_]/_/g'
}

# Return the optional local source path for a docs key.
# Priority:
#   1. Environment variable, useful for local one-off testing
#   2. external-docs.json localPath, useful if we ever want a checked-in default
local_source_for_key() {
	local key="$1"
	local env_name
	env_name="$(local_env_name "$key")"

	if [ -n "${!env_name:-}" ]; then
		echo "${!env_name}"
		return
	fi

	jq -r ".\"$key\".localPath // \"\"" "$CONFIG_FILE"
}

# Accept either a repo root (/path/to/project-quiver) or the docs folder itself
# (/path/to/project-quiver/docs).
resolve_docs_source() {
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

# Hash the source tree so watch mode can notice changes without extra tools like
# fswatch/inotifywait. This is simple and portable, but intentionally not magic:
# every few seconds we hash the docs files and compare with the previous hash.
source_fingerprint() {
	local source_dir="$1"

	find "$source_dir" -type f \
		! -name '.DS_Store' \
		! -name 'mkdocs.yaml' \
		! -name 'mkdocs.yml' \
		-exec shasum {} + 2>/dev/null | sort | shasum | awk '{print $1}'
}

# Copy source docs into the website repo. The source can be either:
#   - a local checkout (for fast edit/preview loops), or
#   - a temporary sparse clone from GitHub (for normal builds/deploys).
copy_source_docs() {
	local key="$1"
	local repo="$2"
	local branch="$3"
	local docs_path="$4"
	local target_path="$5"
	local local_source="$6"
	local source_dir
	local tmp_dir=""

	if [ -n "$local_source" ]; then
		source_dir="$(resolve_docs_source "$local_source" "$docs_path")"
		echo "Importing docs from local path $source_dir..."
	else
		echo "Importing docs from $repo ($branch)..."

		tmp_dir="$(mktemp -d)"
		git clone --depth 1 --branch "$branch" --filter=blob:none --sparse \
			"https://github.com/$repo.git" "$tmp_dir"

		cd "$tmp_dir"
		git sparse-checkout set "$docs_path"
		cd "$PROJECT_ROOT"
		source_dir="$tmp_dir/$docs_path"
	fi

	rm -rf "$target_path"
	mkdir -p "$target_path"

	rsync -av --exclude='.DS_Store' --exclude='mkdocs.yaml' --exclude='mkdocs.yml' \
		"$source_dir/" "$target_path/"

	if [ -n "$tmp_dir" ]; then
		rm -rf "$tmp_dir"
	fi
}

# Docusaurus uses MDX, which is stricter than plain Markdown. Patch a few common
# HTML tags from imported docs so they do not break the Docusaurus build.
fix_mdx_compatibility() {
	local target_path="$1"

	echo "  Fixing MDX compatibility..."
	find "$target_path" -name "*.md" -type f | while read -r mdfile; do
		sed_inplace \
			-e 's/<br>/<br\/>/g' \
			-e 's/<hr>/<hr\/>/g' \
			-e 's/<img \([^>]*[^/]\)>/<img \1 \/>/g' \
			"$mdfile"
	done
}

# Docusaurus should not compile generated HTML files like interactive BOMs as
# docs pages. Move them under static/docs/... where they are served as raw files.
move_html_to_static() {
	local key="$1"
	local target_path="$2"
	local static_path="static/docs/$key"

	rm -rf "$static_path"
	mkdir -p "$static_path"

	echo "  Moving HTML files to static folder..."
	find "$target_path" -name "*.html" -type f | while read -r html_file; do
		local rel_path rel_dir
		rel_path="${html_file#$target_path/}"
		rel_dir="$(dirname "$rel_path")"

		mkdir -p "$static_path/$rel_dir"
		mv "$html_file" "$static_path/$rel_path"
		echo "    Moved: $rel_path -> $static_path/$rel_path"
	done
}

# After HTML files move to static/docs/..., update Markdown links that pointed at
# the old relative HTML location.
update_html_links() {
	local key="$1"
	local target_path="$2"

	echo "  Updating HTML links in markdown files..."
	find "$target_path" \( -name "*.md" -o -name "*.mdx" \) -type f | while read -r mdfile; do
		local md_rel_dir
		md_rel_dir="$(dirname "${mdfile#$target_path/}")"

		sed_inplace \
			-e "s|\./assets/\([^)]*\.html\)|pathname:///docs/$key/$md_rel_dir/assets/\1|g" \
			"$mdfile" 2>/dev/null || true
	done
}

# Markdown image syntax gets processed by Docusaurus, but raw HTML image tags and
# binary-file links keep their relative URLs. Mirror non-doc assets under the
# public route so those URLs still resolve.
mirror_static_assets() {
	local key="$1"
	local target_path="$2"
	local route_base="$3"
	local asset_static_path="static/$route_base"

	echo "  Mirroring static assets to /$route_base/..."
	rm -rf "$asset_static_path"
	mkdir -p "$asset_static_path"
	rsync -a \
		--exclude='*.md' \
		--exclude='*.mdx' \
		--exclude='_category_.json' \
		--exclude='.DS_Store' \
		"$target_path/" "$asset_static_path/"
}

# Small one-off fixes for imported docs whose links do not quite match this
# website's Docusaurus route structure.
patch_known_route_mismatches() {
	local key="$1"
	local target_path="$2"

	if [ "$key" = "project-quiver" ] && [ -f "$target_path/index.md" ]; then
		# Engineering-Reports/_category_.json sets label "Reference / Engineering Reports",
		# which Docusaurus slugifies to /quiver/category/reference--engineering-reports/.
		sed_inplace \
			-e 's|\[Engineering Reports\](\./Engineering-Reports/)|[Engineering Reports](/quiver/category/reference--engineering-reports/)|g' \
			"$target_path/index.md" 2>/dev/null || true
	fi
}

# If the imported docs folder does not define a Docusaurus category, create a
# simple one so the docs appear nicely in the sidebar.
create_default_category_if_needed() {
	local key="$1"
	local target_path="$2"
	local sidebar_label="$3"
	local sidebar_position="$4"
	local custom_target="$5"

	if [ -n "$custom_target" ] || [ -f "$target_path/_category_.json" ]; then
		return
	fi

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
}

# Import one entry from external-docs.json.
import_key() {
	local key="$1"

	local repo branch docs_path sidebar_label sidebar_position target_path route_base custom_target local_source
	repo="$(jq -r ".\"$key\".repo" "$CONFIG_FILE")"
	branch="$(jq -r ".\"$key\".branch // \"main\"" "$CONFIG_FILE")"
	docs_path="$(jq -r ".\"$key\".docsPath // \"docs\"" "$CONFIG_FILE")"
	sidebar_label="$(jq -r ".\"$key\".sidebarLabel // \"$key\"" "$CONFIG_FILE")"
	sidebar_position="$(jq -r ".\"$key\".sidebarPosition // 99" "$CONFIG_FILE")"
	target_path="$(jq -r ".\"$key\".targetPath // \"docs/$key\"" "$CONFIG_FILE")"
	route_base="$(jq -r ".\"$key\".routeBasePath // empty" "$CONFIG_FILE")"
	custom_target="$(jq -r ".\"$key\".targetPath // \"\"" "$CONFIG_FILE")"
	local_source="$(local_source_for_key "$key")"

	# Default public route when external-docs.json does not specify one.
	if [ -z "$route_base" ]; then
		if [ "$key" = "project-quiver" ]; then
			route_base="quiver"
		else
			route_base="$key"
		fi
	fi

	copy_source_docs "$key" "$repo" "$branch" "$docs_path" "$target_path" "$local_source"
	fix_mdx_compatibility "$target_path"
	move_html_to_static "$key" "$target_path"
	update_html_links "$key" "$target_path"
	mirror_static_assets "$key" "$target_path" "$route_base"
	patch_known_route_mismatches "$key" "$target_path"
	create_default_category_if_needed "$key" "$target_path" "$sidebar_label" "$sidebar_position" "$custom_target"

	echo "✓ Imported $repo -> $target_path"
}

run_import() {
	for key in $(jq -r 'keys[]' "$CONFIG_FILE"); do
		import_key "$key"
	done

	echo ""
	echo "All external docs imported successfully"
}

# For normal builds: import once and exit.
run_import

# For local development: keep watching local source folders and re-import when
# they change. Only local folders are watched; GitHub-cloned sources are not.
if [ "$WATCH_MODE" -eq 1 ]; then
	WATCH_KEYS=()
	WATCH_SOURCES=()
	WATCH_FINGERPRINTS=()

	for key in $(jq -r 'keys[]' "$CONFIG_FILE"); do
		local_source="$(local_source_for_key "$key")"
		if [ -n "$local_source" ]; then
			docs_path="$(jq -r ".\"$key\".docsPath // \"docs\"" "$CONFIG_FILE")"
			source_dir="$(resolve_docs_source "$local_source" "$docs_path")"

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
