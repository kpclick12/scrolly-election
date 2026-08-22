#!/usr/bin/env bash
set -euo pipefail

val_root="data/raw/valmyndigheten/2022"
val_zip_dir="$val_root/gis-zips"
val_json_dir="$val_root/gis-json"
val_result_dir="$val_root/results"
scb_root="data/raw/scb/2022"
scb_page_dir="$scb_root/district-attributes-pages"
processed_dir="data/processed"

mkdir -p "$val_zip_dir" "$val_json_dir" "$val_result_dir" "$scb_page_dir" "$processed_dir" public/data

gis_downloads=(
  "valdistrikt-blekinge-lan.zip|https://www.val.se/download/18.162047b519a91d053311a213/1662820376999/valdistrikt-blekinge-lan.zip"
  "valdistrikt-dalarnas-lan.zip|https://www.val.se/download/18.162047b519a91d053311a21b/1662820377075/valdistrikt-dalarnas-lan.zip"
  "valdistrikt-gavleborgs-lan.zip|https://www.val.se/download/18.162047b519a91d053311a21a/1662820377161/valdistrikt-gavleborgs-lan.zip"
  "valdistrikt-gotlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a219/1662820377252/valdistrikt-gotlands-lan.zip"
  "valdistrikt-hallands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a218/1662820377293/valdistrikt-hallands-lan.zip"
  "valdistrikt-jamtlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a217/1662820377388/valdistrikt-jamtlands-lan.zip"
  "valdistrikt-jonkopings-lan.zip|https://www.val.se/download/18.162047b519a91d053311a216/1662820377456/valdistrikt-jonkopings-lan.zip"
  "valdistrikt-kalmar-lan.zip|https://www.val.se/download/18.162047b519a91d053311a215/1662820377582/valdistrikt-kalmar-lan.zip"
  "valdistrikt-kronobergs-lan.zip|https://www.val.se/download/18.162047b519a91d053311a214/1662820377669/valdistrikt-kronobergs-lan.zip"
  "valdistrikt-norrbottens-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1f7/1662820377760/valdistrikt-norrbottens-lan.zip"
  "valdistrikt-skane-lan.zip|https://www.val.se/download/18.162047b519a91d053311a203/1662820378016/valdistrikt-skane-lan.zip"
  "valdistrikt-stockholms-lan.zip|https://www.val.se/download/18.162047b519a91d053311a201/1662820378259/valdistrikt-stockholms-lan.zip"
  "valdistrikt-sodermanlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a202/1662820378175/valdistrikt-sodermanlands-lan.zip"
  "valdistrikt-uppsala-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1ff/1662820378349/valdistrikt-uppsala-lan.zip"
  "valdistrikt-varmlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1f2/1662820378429/valdistrikt-varmlands-lan.zip"
  "valdistrikt-vasterbottens-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1f1/1662820378537/valdistrikt-vasterbottens-lan.zip"
  "valdistrikt-vasternorrlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1f5/1662820378604/valdistrikt-vasternorrlands-lan.zip"
  "valdistrikt-vastmanlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1f4/1662820378694/valdistrikt-vastmanlands-lan.zip"
  "valdistrikt-vastra-gotalands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a1f3/1662820378765/valdistrikt-vastra-gotalands-lan.zip"
  "valdistrikt-orebro-lan.zip|https://www.val.se/download/18.162047b519a91d053311a206/1662820377828/valdistrikt-orebro-lan.zip"
  "valdistrikt-ostergotlands-lan.zip|https://www.val.se/download/18.162047b519a91d053311a204/1662820377920/valdistrikt-ostergotlands-lan.zip"
)

for entry in "${gis_downloads[@]}"; do
  filename="${entry%%|*}"
  url="${entry#*|}"
  curl --fail --location --retry 3 --silent --show-error "$url" --output "$val_zip_dir/$filename"
  unzip -jo "$val_zip_dir/$filename" '*.json' -d "$val_json_dir" >/dev/null
done

excel_filename="Roster-per-distrikt-slutligt-antal-roster-inklusive-totalt-valdeltagande-riksdagsvalet-2022.xlsx"
excel_url="https://www.val.se/download/18.162047b519a91d0533118f4b/1764336897948/$excel_filename"
curl --fail --location --retry 3 --silent --show-error "$excel_url" --output "$val_result_dir/$excel_filename"

expected_excel_sha="02220e73a7f497d02e23e11cc0765b9891f3a11b3738a5750182ca0c2c58a04d"
actual_excel_sha="$(shasum -a 256 "$val_result_dir/$excel_filename" | awk '{print $1}')"
if [[ "$actual_excel_sha" != "$expected_excel_sha" ]]; then
  printf 'Unexpected Excel SHA256: %s\n' "$actual_excel_sha" >&2
  exit 1
fi

scb_service="https://services8.arcgis.com/9CUL84k8apjo6IDh/ArcGIS/rest/services/Valdistrikt_SocEk_ValResult_2022/FeatureServer/0/query"
scb_fields="Valdistrik,Valdistr_1,Valdistr_2,KommunNamn,A_29_år,A_65__år,A_TOTålde,UTB_Lång_,UTB_TOTutb"
for offset in 0 2000 4000 6000; do
  curl --fail --location --retry 3 --silent --show-error --get "$scb_service" \
    --data-urlencode "where=1=1" \
    --data-urlencode "outFields=$scb_fields" \
    --data-urlencode "returnGeometry=false" \
    --data-urlencode "resultOffset=$offset" \
    --data-urlencode "resultRecordCount=2000" \
    --data-urlencode "f=json" \
    --output "$scb_page_dir/$offset.json"
done

jq -cs '{features:(map(.features) | add)}' "$scb_page_dir"/*.json > "$processed_dir/scb-2022-district-attributes.json"
python3 scripts/extract-valmyndigheten-results.py \
  "$val_result_dir/$excel_filename" \
  "$processed_dir/valmyndigheten-2022-district-results.json"
node scripts/build-district-map.mjs

{
  find "$val_zip_dir" "$val_json_dir" "$val_result_dir" "$scb_page_dir" -type f -print0 |
    sort -z |
    xargs -0 shasum -a 256
} > "$processed_dir/source-sha256.txt"

printf 'Downloaded %s county GIS archives and built public/data/districts-map.json\n' "${#gis_downloads[@]}"
