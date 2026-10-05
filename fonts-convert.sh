#!/usr/bin/env bash

UNICODES="U+20-7F,U+A0-FF,U+2010,U+2013,U+2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2039,U+203A,U+20AC,U+20BC,U+2122,U+2191"

fonts=(
  "src/fonts/InterTight.ttf"
  "src/fonts/InterTight-Italic.ttf"
)

for input in "${fonts[@]}"; do
  output="${input%.*}.woff2"
  echo "Converting $input → $output"
  pyftsubset "$input" --flavor=woff2 --output-file="$output" --unicodes="$UNICODES"
done

echo ""
echo "CSS unicode-range à utiliser dans les @font-face :"
css_ranges=$(echo "$UNICODES" | tr ',' '\n' | sed -E 's/^U\+//' | while IFS='-' read -r start end; do
  s=$(printf 'U+%04X' "0x$start")
  if [ -n "$end" ]; then
    printf '%s-%04X\n' "$s" "0x$end"
  else
    echo "$s"
  fi
done | paste -sd ',' -)
echo "unicode-range: $css_ranges;"
