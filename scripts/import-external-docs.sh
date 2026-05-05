#!/bin/bash
set -e

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

# Detect OS for sed compatibility (macOS uses -i '', Linux uses -i)
if [[ "$OSTYPE" == "darwin"* ]]; then
	SED_INPLACE="sed -i ''"
else
	SED_INPLACE="sed -i"
fi

# Iterate over each entry in the config
for key in $(jq -r 'keys[]' "$CONFIG_FILE"); do
	repo=$(jq -r ".\"$key\".repo" "$CONFIG_FILE")
	branch=$(jq -r ".\"$key\".branch // \"main\"" "$CONFIG_FILE")
	docs_path=$(jq -r ".\"$key\".docsPath // \"docs\"" "$CONFIG_FILE")
	sidebar_label=$(jq -r ".\"$key\".sidebarLabel // \"$key\"" "$CONFIG_FILE")
	sidebar_position=$(jq -r ".\"$key\".sidebarPosition // 99" "$CONFIG_FILE")

	target_path=$(jq -r ".\"$key\".targetPath // \"docs/$key\"" "$CONFIG_FILE")

	echo "Importing docs from $repo ($branch)..."

	# Create temp dir and clone with sparse checkout
	tmp_dir=$(mktemp -d)
	git clone --depth 1 --branch "$branch" --filter=blob:none --sparse \
		"https://github.com/$repo.git" "$tmp_dir"

	cd "$tmp_dir"
	git sparse-checkout set "$docs_path"
	cd "$PROJECT_ROOT"

	# Remove old docs and create fresh target directory
	rm -rf "$target_path"
	mkdir -p "$target_path"

	# Copy everything except excluded files
	rsync -av --exclude='.DS_Store' --exclude='mkdocs.yaml' --exclude='mkdocs.yml' \
		"$tmp_dir/$docs_path/" "$target_path/"

	# Fix MDX compatibility issues in markdown files
	echo "  Fixing MDX compatibility..."

	find "$target_path" -name "*.md" -type f -exec $SED_INPLACE \
		-e 's/<br>/<br\/>/g' \
		-e 's/<hr>/<hr\/>/g' \
		-e 's/<img \([^>]*[^/]\)>/<img \1 \/>/g' \
		{} \;

	# Move HTML files to static folder (Docusaurus serves these as-is)
	# Put under static/docs/ so URLs match the /docs/... path
	static_path="static/docs/$key"

	# Clean up old static folder
	rm -rf "$static_path"

	echo "  Moving HTML files to static folder..."
	mkdir -p "$static_path"

	# Find and move HTML files, preserving directory structure
	find "$target_path" -name "*.html" -type f | while read html_file; do
		rel_path="${html_file#$target_path/}"
		rel_dir=$(dirname "$rel_path")

		mkdir -p "$static_path/$rel_dir"
		mv "$html_file" "$static_path/$rel_path"
		echo "    Moved: $rel_path -> $static_path/$rel_path"
	done

	# Update links in markdown files to point to static folder
	echo "  Updating HTML links in markdown files..."
	find "$target_path" \( -name "*.md" -o -name "*.mdx" \) -type f | while read mdfile; do
		md_rel_dir=$(dirname "${mdfile#$target_path/}")

		$SED_INPLACE \
			-e "s|\./assets/\([^)]*\.html\)|pathname:///docs/$key/$md_rel_dir/assets/\1|g" \
			"$mdfile" 2>/dev/null || true
	done

	# Docusaurus processes Markdown image syntax into hashed build assets, but
	# raw HTML <img src="..."> tags and links to binary assets keep their
	# relative URLs. Mirror imported non-doc assets under the public route so
	# those relative URLs resolve on the deployed site.
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
		$SED_INPLACE \
			-e 's|\[Engineering Reports\](\./Engineering-Reports/)|[Engineering Reports](/quiver/category/engineering-reports/)|g' \
			"$target_path/index.md" 2>/dev/null || true
	fi

	# Create _category_.json for sidebar only when importing into the default docs/ subfolder
	# (not needed for top-level plugin roots specified via targetPath)
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
	rm -rf "$tmp_dir"

	echo "✓ Imported $repo -> $target_path"
done

echo ""
echo "All external docs imported successfully"
