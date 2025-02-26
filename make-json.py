import json
import re
from collections import defaultdict

# 入力ファイルと出力ファイルの指定
input_file = "./2c91c9cbedf17a490dca-2d349f67406514a6afbbe90914fa9b755ef69919/credit_card_bin_codes.md"
output_file = "bin-db.json"

# JSONデータ保存用
bin_data = {}
current_category = None

# 正規表現パターン
category_pattern = re.compile(r"^# (\d+)-(.+)")
bin_pattern = re.compile(r"^- ([0-9\-]+) (.+)")

# BINの上1桁ごとのカウント（MDファイルから）
bin_prefix_count_md = defaultdict(int)

# Markdownファイルを読み込み
with open(input_file, "r", encoding="utf-8") as file:
    for line in file:
        line = line.strip()

        # カテゴリの判定
        category_match = category_pattern.match(line)
        if category_match:
            current_category = f"{category_match.group(1)}-{category_match.group(2).strip()}"
            bin_data[current_category] = []
            continue

        # BINコードの抽出
        bin_match = bin_pattern.match(line)
        if bin_match and current_category:
            bin_code = bin_match.group(1)
            description = bin_match.group(2)

            # BINの上1桁を取得
            first_digit = bin_code[0]

            # 上1桁のカウントを増加
            bin_prefix_count_md[first_digit] += 1

            # JSONデータに追加
            bin_data[current_category].append({"bin": bin_code, "description": description})

# JSONファイルに書き込み
with open(output_file, "w", encoding="utf-8") as json_file:
    json.dump(bin_data, json_file, indent=4, ensure_ascii=False)

print(f"JSONファイル {output_file} を作成しました。")

# --- 生成後のJSONデータを読み込んでチェック ---
with open(output_file, "r", encoding="utf-8") as json_file:
    loaded_data = json.load(json_file)

# JSONファイル内のBINの上1桁カウント
bin_prefix_count_json = defaultdict(int)

for category, bins in loaded_data.items():
    for entry in bins:
        bin_code = entry["bin"]
        first_digit = bin_code[0]
        bin_prefix_count_json[first_digit] += 1

# --- 検出結果の比較 ---
print("\n【デバッグ情報】BINの上1桁ごとのカウント")
print("MDファイルでのカウント:")
for digit, count in sorted(bin_prefix_count_md.items()):
    print(f"  {digit}: {count}件")

print("\nJSONファイルでのカウント:")
for digit, count in sorted(bin_prefix_count_json.items()):
    print(f"  {digit}: {count}件")

# --- 一致チェック ---
if bin_prefix_count_md == bin_prefix_count_json:
    print("\n✅ JSONファイルのBINデータはMDファイルと一致しています。")
else:
    print("\n❌ JSONファイルのBINデータに不一致があります。確認してください。")
