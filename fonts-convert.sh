#!/usr/bin/env bash

# Caractères inclus dans le subset (UNICODES), regroupés par famille :
#
# 1. Latin de base (ASCII imprimable) — U+0020-007F
#    - Espace
#    - Ponctuation : ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
#    - Chiffres : 0-9
#    - Lettres : A-Z, a-z
#    - U+007F (DEL, caractère de contrôle, inclus par le range)
#
# 2. Latin-1 Supplément — U+00A0-00A3, U+00A6-00FF (¤ U+00A4 et ¥ U+00A5 exclus)
#    - U+00A0 : espace insécable
#    - Ponctuation et symboles : ¡ ¢ £ ¦ § ¨ © ª « ¬ (trait d'union conditionnel) ® ¯ ° ± ² ³ ´ µ ¶ · ¸ ¹ º » ¼ ½ ¾ ¿
#      (inclut les guillemets français « » et les symboles × ÷)
#    - Lettres accentuées majuscules : À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö Ø Ù Ú Û Ü Ý Þ
#    - Lettres accentuées minuscules : ß à á â ã ä å æ ç è é ê ë ì í î ï ð ñ ò ó ô õ ö ø ù ú û ü ý þ ÿ
#    => couvre tout le français (é è ê ë à â ç î ï ô ù û ü ÿ), sauf Œ/œ (U+0152/0153) non inclus
#
# 3. Ponctuation typographique générale — U+2010-203A
#    - U+2010 : trait d'union (‐)
#    - U+2013 : demi-cadratin (–)
#    - U+2014 : cadratin (—)
#    - U+2018-201A : apostrophes / guillemets simples (‘ ’ ‚)
#    - U+201C-201E : guillemets doubles anglais (“ ” „)
#    - U+2022 : puce (•)
#    - U+2026 : points de suspension (…)
#    - U+2039-203A : guillemets simples français (‹ ›)
#
# 4. Symboles monétaires
#    - $ (U+0024), ¢ (U+00A2), £ (U+00A3), € (U+20AC)
#    - Exclus car non pertinents (Canada/USA) : ¤ ¥ ₼
#
# 5. Symboles divers
#    - U+2122 : marque de commerce (™)
#    - U+2191 : flèche vers le haut (↑)
#
# Non inclus (attention) : Œ œ Ÿ (U+0152, 0153, 0178), apostrophe typographique
# droite ’ est inclus (U+2019), mais pas les flèches →/← ni ≠ ≤ ≥.
UNICODES="U+20-7F,U+A0-A3,U+A6-FF,U+2010,U+2013,U+2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2039,U+203A,U+20AC,U+2122,U+2191"

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
