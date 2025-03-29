#!/bin/bash

# Get the target HTML file path from the first command-line argument
target_html="$1"

# Define output CSS file
output_css="temp.css"

# Check if an HTML file path was provided
if [ -z "$target_html" ]; then
  echo "Error: Please provide the path to the HTML template as an argument."
  echo "Usage: ./inline-css.sh <path/to/your/template.html>"
  exit 1
fi

# Check if HTML file exists
if [ ! -f "$target_html" ]; then
  echo "Error: HTML file not found at $target_html"
  exit 1
fi

# Build Tailwind CSS for the specific HTML file
echo "Building Tailwind CSS for $target_html..."
npx tailwindcss -o "$output_css" --minify --content="$target_html"

if [ $? -ne 0 ]; then
  echo "Error building Tailwind CSS."
  exit 1
fi

echo "Tailwind CSS built -> $output_css"

# Remove the Tailwind banner comment and any other CSS comments
sed -i 's@/\*!\s*tailwindcss[^*]*\*/@@g' "$output_css"
sed -i 's@/\*[^*]*\*/@@g' "$output_css"

# Inline CSS into the HTML file
echo "Inlining CSS into $target_html..."

# Use awk to insert the style block after the <head> tag safely
awk -v css="$(cat "$output_css")" '
    /<head>/ {print; print "<style>"; print css; print "</style>"; next} 
    {print}
' "$target_html" > temp.html && mv temp.html "$target_html"

if [ $? -ne 0 ]; then
  echo "Error inlining CSS."
  exit 1
fi

# Clean up the temporary CSS file
rm "$output_css"

echo "CSS inlined successfully into $target_html"
