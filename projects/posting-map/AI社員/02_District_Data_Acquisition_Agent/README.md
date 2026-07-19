# README.md - District Data Acquisition Agent (地区基本データ取得AI社員)

## 概要

`District Data Acquisition Agent` は、POSTING MAP導入時に指定された選挙区から、地図の生成やポスティング区割りの初期設定に不可欠な「選挙区基本情報」「構成自治体リスト」「全国地方公共団体コード（自治体コード）」を正確に照合・取得し、`District Master` へ登録する一次データ取得担当のAI社員である。

## ミッション

「指定された任意の日本国内の選挙区から、人間が介在することなく正確に自治体構成とコードを特定し、初期化用Rawデータを用意する」

## 基本動作

```
入力: 選挙区名 (例: "埼玉県第8区")
  ↓
[District Data Acquisition Agent] 起動
  ↓
1. 選挙区基本情報の特定 (ID生成)
2. 構成自治体の照合 (所沢市、ふじみ野市、三芳町 など)
3. 自治体コード (JISコード等) の取得・マッピング
  ↓
出力: 基礎データ (Raw District Data) ➔ District Master 登録可能状態
```

## 組織図内での位置付け

```
01_District_Initialization_Agent (全体初期化統制)
       |
       └── 02_District_Data_Acquisition_Agent (★本AI社員: 基礎データ取得)
                |
                ├ 地区情報取得
                ├ 自治体取得
                ├ 自治体コード取得
                └ 基礎データ保存
```
