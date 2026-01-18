#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Configuration: Add repos here
# Format: "org/repo:source_path:target_path:branch:sidebar_label:sidebar_position"
DOCS_SOURCES=(
  "Arrow-air/project-quiver:docs/:docs/project-quiver/:docs-refactor:Project Quiver:4"
)

for source in "${DOCS_SOURCES[@]}"; do
  IFS=':' read -r repo src_path target_path branch sidebar_label sidebar_position <<< "$source"
  branch=${branch:-main}  # Default to main if not specified

  echo "Importing docs from $repo ($branch)..."

  # Create temp dir and clone with sparse checkout
  tmp_dir=$(mktemp -d)
  git clone --depth 1 --branch "$branch" --filter=blob:none --sparse \
    "https://github.com/$repo.git" "$tmp_dir"

  cd "$tmp_dir"
  git sparse-checkout set "$src_path"
  cd "$PROJECT_ROOT"

  # Remove old docs and create fresh target directory
  rm -rf "$target_path"
  mkdir -p "$target_path"

  # Copy everything except excluded files
  rsync -av --exclude='.DS_Store' --exclude='mkdocs.yaml' --exclude='mkdocs.yml' \
    "$tmp_dir/$src_path" "$target_path"

  # Fix MDX compatibility issues in markdown files
  # Convert self-closing HTML tags to JSX format
  echo "  Fixing MDX compatibility..."

  # Detect OS for sed compatibility (macOS uses -i '', Linux uses -i)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_INPLACE="sed -i ''"
  else
    SED_INPLACE="sed -i"
  fi

  find "$target_path" -name "*.md" -type f -exec $SED_INPLACE \
    -e 's/<br>/<br\/>/g' \
    -e 's/<hr>/<hr\/>/g' \
    -e 's/<img \([^>]*[^/]\)>/<img \1 \/>/g' \
    {} \;

  # Move HTML files to static folder (Docusaurus serves these as-is)
  # Extract the last part of target_path for static folder name (e.g., "project-quiver")
  static_subdir=$(basename "$target_path")
  static_path="static/$static_subdir"

  # Clean up old static folder
  rm -rf "$static_path"

  echo "  Moving HTML files to static folder..."
  mkdir -p "$static_path"

  # Normalize target_path (remove trailing slash if present)
  normalized_target="${target_path%/}"

  # Find and move HTML files, preserving directory structure relative to target_path
  find "$normalized_target" -name "*.html" -type f | while read html_file; do
    # Get relative path from target_path
    rel_path="${html_file#$normalized_target/}"
    rel_dir=$(dirname "$rel_path")

    # Create target directory in static and move file
    mkdir -p "$static_path/$rel_dir"
    mv "$html_file" "$static_path/$rel_path"
    echo "    Moved: $rel_path -> $static_path/$rel_path"
  done

  # Update links in markdown files to point to static folder
  # Match patterns like ./assets/foo.html or ./subdir/assets/foo.html
  echo "  Updating HTML links in markdown files..."
  find "$normalized_target" \( -name "*.md" -o -name "*.mdx" \) -type f | while read mdfile; do
    # Get the relative directory of this md file from the target
    md_rel_dir=$(dirname "${mdfile#$normalized_target/}")

    # Replace relative HTML links with absolute paths to static folder
    $SED_INPLACE \
      -e "s|\./assets/\([^)]*\.html\)|/$static_subdir/$md_rel_dir/assets/\1|g" \
      "$mdfile" 2>/dev/null || true
  done

  # Create _category_.json for sidebar if it doesn't exist in source
  if [ ! -f "$target_path/_category_.json" ]; then
    cat > "$target_path/_category_.json" << EOF
{
  "label": "${sidebar_label}",
  "position": ${sidebar_position},
  "collapsed": true,
  "link": {
    "type": "generated-index",
    "description": "Documentation for ${sidebar_label}"
  }
}
EOF
    echo "  Created _category_.json for sidebar"
  fi

  # Cleanup
  rm -rf "$tmp_dir"

  echo "✓ Imported $repo -> $target_path"
done

echo ""
echo "All external docs imported successfully"
