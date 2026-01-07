#!/bin/bash
# Build script: Convert QMD files to clean HTML using Pandoc (bypassing Quarto)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
QMD_DIR="/Volumes/T9/everything/business/freelance/sethi_textbook/original-code/dafct/chapters"
HTML_DIR="$PROJECT_ROOT/content/html"
ASSETS_DIR="$PROJECT_ROOT/public/assets"

# Ensure output directories exist
mkdir -p "$HTML_DIR"
mkdir -p "$ASSETS_DIR"

# Check for Pandoc
if ! command -v pandoc &> /dev/null; then
    echo "Error: Pandoc is not installed. Please install it first."
    exit 1
fi

echo "Converting QMD files to HTML (via Pandoc, bypassing Quarto)..."
echo ""

# Find all index.qmd files in chapter folders
find "$QMD_DIR" -name "index.qmd" -type f | while read -r qmd_file; do
    # Get the chapter folder name as the slug
    chapter_dir=$(dirname "$qmd_file")
    slug=$(basename "$chapter_dir")

    echo "  Converting: $slug"

    # Convert QMD to HTML using Pandoc
    pandoc "$qmd_file" \
        -f markdown \
        -t html \
        --katex \
        -o "$HTML_DIR/$slug.html" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "    ✓ Created: $slug.html"

        # Copy assets (images, figures, animations, interactives) if they exist
        for asset_folder in images figures animations assets interactives; do
            if [ -d "$chapter_dir/$asset_folder" ]; then
                mkdir -p "$ASSETS_DIR/$slug/$asset_folder"
                cp -r "$chapter_dir/$asset_folder/"* "$ASSETS_DIR/$slug/$asset_folder/" 2>/dev/null
                echo "    ✓ Copied: $asset_folder/"
            fi
        done

        # Rewrite image paths in HTML to point to /assets/[slug]/
        # images/foo.png -> /assets/slug/images/foo.png
        sed -i '' "s|src=\"images/|src=\"/assets/$slug/images/|g" "$HTML_DIR/$slug.html"
        sed -i '' "s|src=\"figures/|src=\"/assets/$slug/figures/|g" "$HTML_DIR/$slug.html"
        sed -i '' "s|src=\"animations/|src=\"/assets/$slug/animations/|g" "$HTML_DIR/$slug.html"
        sed -i '' "s|src=\"assets/|src=\"/assets/$slug/assets/|g" "$HTML_DIR/$slug.html"
        sed -i '' "s|src=\"interactives/|src=\"/assets/$slug/interactives/|g" "$HTML_DIR/$slug.html"

    else
        echo "    ✗ Failed: $slug"
    fi
done

echo ""
echo "Build complete."
echo "  HTML files in: $HTML_DIR"
echo "  Assets in: $ASSETS_DIR"
echo ""
ls "$HTML_DIR"/*.html 2>/dev/null | wc -l | xargs echo "Total HTML files:"
