#!/usr/bin/env bash

UNICODES="U+20-7F,U+A0-FF,U+2010,U+2013,U+2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2039,U+203A,U+20AC,U+20BC,U+2122,U+2191"

fonts=(
  "src/fonts/SofiaPro-Black.otf"
  "src/fonts/SofiaPro-Blackitalic.otf"
)

for input in "${fonts[@]}"; do
  output="${input%.*}.woff2"
  echo "Converting $input → $output"
  pyftsubset "$input" --flavor=woff2 --output-file="$output" --unicodes="$UNICODES"
done
