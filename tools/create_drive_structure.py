import json
import os
import requests
import sys

def get_access_token():
    # Read active ~/.clasprc.json
    path = os.path.expanduser('~/.clasprc.json')
    if not os.path.exists(path):
        # Fallback to local backup
        path = '/Volumes/SSD_DATA/posting-map-system/.clasprc.json.local.bak'
        
    if not os.path.exists(path):
        raise Exception("No clasp configuration file found.")
        
    with open(path, 'r') as f:
        data = json.load(f)
    token_info = data['tokens']['default']
    payload = {
        'client_id': token_info['client_id'],
        'client_secret': token_info['client_secret'],
        'refresh_token': token_info['refresh_token'],
        'grant_type': 'refresh_token'
    }
    res = requests.post('https://oauth2.googleapis.com/token', json=payload)
    return res.json()['access_token']

def get_or_create_folder(name, parent_id, headers):
    # Search for folder
    query = f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    
    res = requests.get('https://www.googleapis.com/drive/v3/files', headers=headers, params={'q': query, 'fields': 'files(id, name)'})
    files = res.json().get('files', [])
    if files:
        print(f"Folder '{name}' already exists with ID: {files[0]['id']}")
        return files[0]['id'], False
    
    # Create folder
    metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    if parent_id:
        metadata['parents'] = [parent_id]
        
    res = requests.post('https://www.googleapis.com/drive/v3/files', headers=headers, json=metadata)
    folder_info = res.json()
    print(f"Created Folder '{name}' with ID: {folder_info['id']}")
    return folder_info['id'], True

def create_or_update_readme(folder_id, folder_name, readme_content, headers):
    # Check if README.md exists
    query = f"name = 'README.md' and '{folder_id}' in parents and trashed = false"
    res = requests.get('https://www.googleapis.com/drive/v3/files', headers=headers, params={'q': query, 'fields': 'files(id)'})
    files = res.json().get('files', [])
    
    if files:
        file_id = files[0]['id']
        # Update existing file content
        update_headers = headers.copy()
        update_headers['Content-Type'] = 'text/plain; charset=UTF-8'
        res_update = requests.patch(
            f'https://www.googleapis.com/upload/drive/v3/files/{file_id}?uploadType=media',
            headers=update_headers,
            data=readme_content.encode('utf-8')
        )
        print(f"Updated README.md in {folder_name} (ID: {file_id})")
        return file_id, False
    else:
        # Create new file
        file_metadata = {
            'name': 'README.md',
            'parents': [folder_id]
        }
        files_payload = {
            'metadata': (None, json.dumps(file_metadata), 'application/json; charset=UTF-8'),
            'file': ('README.md', readme_content, 'text/markdown; charset=UTF-8')
        }
        res_create = requests.post(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers=headers,
            files=files_payload
        )
        file_info = res_create.json()
        print(f"Created README.md in {folder_name} (ID: {file_info['id']})")
        return file_info['id'], True

# Define README contents
READMES = {
    "01_MASTER": """# 01_MASTER

## 役割
システム全体および組織全体の変更頻度の低い基礎データ（マスターデータ）の管理

## 保存対象
- 行政データ、地域データ、郵便番号データ
- テンプレートファイル
- 初期設定ファイル、マスタCSV
- 統一エリアマスター（全国・県連・ブロック・支部対応のマスターシート）
- ライセンス・アカウント管理マスター

## 保存禁止データ
- 日々の配布ログ（支部データ）
- 各種バックアップファイル
- 写真・画像などのバイナリファイル（04_STORAGEへ）

## 命名規則
`MASTER_[データ名]_v[バージョン]`
（例: `MASTER_AREA_LIST_v1.0`, `MASTER_POSTAL_CODE_v1.0`）

## 運用ルール
1. 本部管理者のみが編集権限を持つ（ブロック・県連・支部は閲覧専用）。
2. 変更時は必ず本部の品質管理部（AI総監督含む）の承認を必須とし、変更履歴シートに記録する。
""",
    "02_SYSTEM": """# 02_SYSTEM

## 役割
システム連携、API設定、システム稼働状況および運用構成ファイルの管理

## 保存対象
- システム設定シート（APIエンドポイント、LIFF IDマッピングなど）
- リソース定義、アセット管理インデックス（JSON形式、設定等）
- clasp連携等の開発設定

## 保存禁止データ
- 個人情報（配布員の名前や連絡先など）
- 日常の配布ログ
- マスターデータ原本

## 命名規則
`SYSTEM_[設定名]_[環境]`
（例: `SYSTEM_CONFIG_MIE02`, `SYSTEM_API_ROUTING_PROD`）

## 運用ルール
1. 開発部およびセキュリティ管理者のみが書き込み可能。
2. 本番環境（PROD）の変更時は、二重チェックを行い、検証環境（DEV）での動作確認完了後に反映する。
""",
    "03_BRANCH": """# 03_BRANCH

## 役割
支部ごとの配布活動、現場状況、個別設定の管理

## 保存対象
- 支部個別スプレッドシート（配布進捗、エリア担当者割り当て）
- 支部内配布活動集計データ
- 支部独自の設定資料

## 保存禁止データ
- 配布員の撮影した現地の写真（写真は04_STORAGEへ）
- 全システム共通マスターデータ
- システムバックアップ

## 命名規則
`BRANCH_[支部ID]_[データ名]`
（例: `BRANCH_MIE02_DISTRIBUTION_PROGRESS`, `BRANCH_TOKYO01_CONFIG`）

## 運用ルール
1. 各支部の運用担当者および本部に編集権限を付与。他支部からは閲覧不可とする。
2. スプレッドシートは直接編集せず、原則として管理者アプリ（Kアプリ）または配布員アプリ（Hアプリ）経由で更新する。
""",
    "04_STORAGE": """# 04_STORAGE

## 役割
ユーザーアップロードデータの保存（大容量メディアや各種添付ファイル）

## 保存対象
- ユーザーアップロードデータ（写真、動画、PDF、CSV、JSON、ZIPなど）
- 配布完了時の現場撮影写真・エビデンス画像
- 配布物（チラシ・広報誌）のPDF/画像原本

## 保存禁止データ
- システム設定ファイルやプログラムコード
- 個人情報が含まれる無関係な画像

## 命名規則
`STORAGE_[支部ID]_[日付]_[配布員ID]_[画像・ファイル用途]_[通番]`
（例: `STORAGE_MIE02_20260705_U102_EVIDENCE_001.jpg`）

## 運用ルール
1. 写真はアプリから直接Google Cloud Storageまたは指定のDriveフォルダに自動アップロードする。
2. 手動でのアップロードは禁止し、定期的にアーカイブ（99_ARCHIVE）に退避してアクティブフォルダの容量を一定に保つ。
""",
    "05_BACKUP": """# 05_BACKUP

## 役割
システムデータ、データベース、設定の定期・変更前バックアップ

## 保存対象
- 支部Spreadsheetの定期コピー（デイリー/ウィークリー）
- マスターデータ・設定ファイルのバージョンバックアップ

## 保存禁止データ
- 写真・動画などのメディアファイル
- 日常で使用するアクティブなファイル（直接編集禁止）

## 命名規則
`BACKUP_[対象名]_[日付時間]`
（例: `BACKUP_MASTER_AREA_20260705_120000`）

## 運用ルール
1. 自動スクリプトまたは管理者によるデプロイ・更新前に必ず作成する。
2. 保存期間は30日間とし、それを超えたものは自動または手動で削除、もしくはアーカイブへ移動する。
""",
    "06_DASHBOARD": """# 06_DASHBOARD

## 役割
意思決定・可視化のためのダッシュボード構成、レポート、営業フック用データの管理

## 保存対象
- Dashboard関連ファイル（Looker Studio、React/Next.js Dashboard、Chart.js、ECharts用構成ファイル等）
- 報告書・レポート用データ（サマリーデータ）
- 営業用デモデータ、デモDashboard設定

## 保存禁止データ
- 現場の生写真
- 生の個別配布ログ（アグリゲーション後のサマリーデータのみを推奨）

## 命名規則
`DASHBOARD_[対象階層]_[範囲ID]_[更新日]`
（例: `DASHBOARD_PREFECTURE_MIE_20260705`, `DASHBOARD_HEADQUARTERS_ALL_20260705`）

## 運用ルール
1. 可視化ツールやダッシュボードとの連携用データソースとなるため、カラム構造の変更は厳禁とする。
2. 意思決定者への「3秒で状況が伝わる」デザイン要件を満たしたレポートテンプレートや構成ファイルのみを配置する。
""",
    "07_MANUAL": """# 07_MANUAL

## 役割
配布員、管理者、支部、本部向けの操作手順書および運用の手引きの管理

## 保存対象
- Hアプリ（配布員用）利用マニュアル（PDF、画像）
- Kアプリ（管理者用）管理・操作マニュアル
- トラブルシューティングガイド

## 保存禁止データ
- 実データ、稼働ログ
- バックアップファイル

## 命名規則
`MANUAL_[対象]_[用途]_v[バージョン]`
（例: `MANUAL_STAFF_HOWTO_v1.2`, `MANUAL_ADMIN_OPERATION_v2.0`）

## 運用ルール
1. 常に最新版のみを配置し、古いバージョンは99_ARCHIVEに移動する。
2. 高齢の配布員でも直感的に理解できるよう、画像やイラストを多用したマニュアルとする。
""",
    "99_ARCHIVE": """# 99_ARCHIVE

## 役割
過去の活動データ、古い設定、保管期限の切れたマニュアル・写真などの退避・保存

## 保存対象
- 過去の選挙・配布活動の完了済みスプレッドシート
- 旧バージョンの設定ファイル、バックアップ
- 旧版マニュアル

## 保存禁止データ
- 現在進行中のアクティブなプロジェクトデータ

## 命名規則
`ARCHIVE_[元カテゴリ]_[元ファイル名]_[アーカイブ日]`
（例: `ARCHIVE_BRANCH_MIE02_2025_ELECTION_20260705`）

## 運用ルール
1. 読み取り専用とし、いかなる場合もアクティブな書き込み・更新を行わない。
2. 容量削減のため、3年以上経過したデータは外部のコールドストレージ等への移行を検討する。
"""
}

def verify_and_loop():
    print("Refreshing access token...")
    token = get_access_token()
    headers = {'Authorization': f'Bearer {token}'}
    
    # Check current email (AIOS Security Check)
    res_user = requests.get('https://www.googleapis.com/oauth2/v1/userinfo', headers=headers)
    if res_user.status_code != 200:
        print("ERROR: Failed to retrieve user email info.", file=sys.stderr)
        sys.exit(1)
    
    current_email = res_user.json().get('email')
    print(f"Current Authed Email: {current_email}")
    
    if current_email != 'postingareamap@gmail.com':
        print(f"ERROR: Pinned Account Mismatch! Expected 'postingareamap@gmail.com', got '{current_email}'. Stopping.", file=sys.stderr)
        sys.exit(1)
        
    print("✔ Account verification PASSED.")
    
    # 1. Get or Create FIELD_OPERATIONS_PLATFORM root
    root_id, created = get_or_create_folder('FIELD_OPERATIONS_PLATFORM', None, headers)
    
    # Loop until 100% verified
    attempts = 0
    max_attempts = 3
    
    while attempts < max_attempts:
        attempts += 1
        print(f"\n--- Verification Attempt {attempts} ---")
        
        # Check subfolders
        query = f"mimeType = 'application/vnd.google-apps.folder' and '{root_id}' in parents and trashed = false"
        res = requests.get('https://www.googleapis.com/drive/v3/files', headers=headers, params={'q': query, 'fields': 'files(id, name)'})
        subfolders = res.json().get('files', [])
        subfolder_map = {f['name']: f['id'] for f in subfolders}
        
        missing_folders = []
        for target in READMES.keys():
            if target not in subfolder_map:
                missing_folders.append(target)
        
        if missing_folders:
            print(f"Missing folders: {missing_folders}. Recreating...")
            for f_name in missing_folders:
                f_id, _ = get_or_create_folder(f_name, root_id, headers)
                subfolder_map[f_name] = f_id
        else:
            print("All 8 target folders exist.")
        
        # Check and update/create READMEs
        readme_errors = []
        for folder_name, folder_id in subfolder_map.items():
            if folder_name not in READMES:
                continue
            
            query_readme = f"name = 'README.md' and '{folder_id}' in parents and trashed = false"
            res_readme = requests.get('https://www.googleapis.com/drive/v3/files', headers=headers, params={'q': query_readme, 'fields': 'files(id)'})
            readmes = res_readme.json().get('files', [])
            
            if not readmes:
                readme_errors.append((folder_name, folder_id))
            else:
                create_or_update_readme(folder_id, folder_name, READMES[folder_name], headers)
        
        if readme_errors:
            print(f"Missing README files in: {[e[0] for e in readme_errors]}. Creating...")
            for folder_name, folder_id in readme_errors:
                create_or_update_readme(folder_id, folder_name, READMES[folder_name], headers)
        else:
            print("All README.md files are present and updated.")
            
        # Final Verification checks
        all_ok = True
        final_tree = []
        for folder_name in sorted(READMES.keys()):
            if folder_name not in subfolder_map:
                all_ok = False
                break
            
            fid = subfolder_map[folder_name]
            qr = f"name = 'README.md' and '{fid}' in parents and trashed = false"
            res_r = requests.get('https://www.googleapis.com/drive/v3/files', headers=headers, params={'q': qr, 'fields': 'files(id)'})
            if not res_r.json().get('files', []):
                all_ok = False
                break
            
            final_tree.append({
                'name': folder_name,
                'id': fid,
                'readme_id': res_r.json().get('files')[0]['id']
            })
            
        if all_ok:
            print("\n✔ Verification successfully passed with 100% compliance on postingareamap@gmail.com!")
            print(f"Root ID: {root_id}")
            print(json.dumps(final_tree, indent=2, ensure_ascii=False))
            
            with open('/Volumes/SSD_DATA/posting-map-system/tools/drive_structure_result.json', 'w') as out_f:
                json.dump({'root_id': root_id, 'tree': final_tree}, out_f, indent=2, ensure_ascii=False)
            return
            
    print("Verification loop failed after maximum attempts.", file=sys.stderr)
    sys.exit(1)

if __name__ == '__main__':
    verify_and_loop()
