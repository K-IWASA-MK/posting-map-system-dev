import os
import sys
import json

# Default values
DEFAULT_CONFIG = {
    "version": 1,
    "schema": 1,
    "cie_version": "2.2.0-alpha.0",
    "platform_phase": "Phase24",
    "theme": "dark",
    "dashboard": {
        "refresh_interval": 30
    },
    "api": {
        "host": "127.0.0.1",
        "port": 8080
    },
    "metrics": {
        "score_max": 100,
        "unused_penalty": 0.2,
        "high_impact_penalty": 0.5,
        "hub_penalty": 0.3,
        "orphan_route_penalty": 2.0
    },
    "export": {
        "default_format": "markdown",
        "output_directory": "exports"
    }
}

def get_config_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_dir = os.path.join(script_dir, "config")
    config_path = os.path.join(config_dir, "cie.config.json")
    default_path = os.path.join(config_dir, "cie.config.default.json")
    return config_dir, config_path, default_path

def merge_and_patch(target, defaults):
    """
    再帰的に defaults のキーを target にマージし、欠落していた数を返す。
    """
    patched_count = 0
    for key, val in defaults.items():
        if key not in target:
            target[key] = val
            patched_count += 1
        elif isinstance(val, dict) and isinstance(target[key], dict):
            patched_count += merge_and_patch(target[key], val)
    return patched_count

def count_missing(target, defaults):
    """
    defaults にあって target にないキーの総数をカウントする。
    """
    missing_count = 0
    for key, val in defaults.items():
        if key not in target:
            missing_count += 1
        elif isinstance(val, dict) and isinstance(target[key], dict):
            missing_count += count_missing(target[key], val)
    return missing_count

def load_config_internal():
    config_dir, config_path, default_path = get_config_paths()
    
    # フォルダ自動生成
    os.makedirs(config_dir, exist_ok=True)
    
    # 初回デフォルトファイル生成 (Backup)
    if not os.path.exists(default_path):
        try:
            with open(default_path, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_CONFIG, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Warning: Failed to create default config backup: {e}", file=sys.stderr)
            
    # 実設定ファイルが無ければデフォルトからコピーして生成
    if not os.path.exists(config_path):
        try:
            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_CONFIG, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Error: Failed to create config file: {e}", file=sys.stderr)
            sys.exit(3)

    # 読み込みと検証
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading config file: {e}", file=sys.stderr)
        raise e

    # 欠落検知と自動補完マージ
    missing_keys = count_missing(config, DEFAULT_CONFIG)
    patched_keys = merge_and_patch(config, DEFAULT_CONFIG)
    
    # 補完が発生した場合はファイルに上書き保存
    if patched_keys > 0:
        try:
            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Warning: Failed to auto-save patched config: {e}", file=sys.stderr)

    return config, missing_keys, patched_keys

def load_config():
    """
    他の Python スクリプトからインポートして設定オブジェクトをロードするための公式API。
    失敗時はデフォルトの DEFAULT_CONFIG を返すセーフガード設計。
    """
    try:
        config, _, _ = load_config_internal()
        return config
    except Exception:
        return DEFAULT_CONFIG

def validate_config():
    """
    CLI/検証エンジンから利用する詳細診断用API。
    """
    return load_config_internal()

def reset_config():
    """
    設定ファイルをデフォルト初期状態に完全にリセットするAPI。
    """
    config_dir, config_path, _ = get_config_paths()
    os.makedirs(config_dir, exist_ok=True)
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(DEFAULT_CONFIG, f, indent=2, ensure_ascii=False)
    return DEFAULT_CONFIG

def main():
    # コマンドライン実行時の簡易動作確認
    try:
        config, missing, patched = validate_config()
        print("CIE Configuration Loader Diagnostics:")
        print(f"Config File   : tools/config/cie.config.json")
        print(f"Schema Version: {config.get('schema', 'N/A')}")
        print(f"CIE Version   : {config.get('cie_version', 'N/A')}")
        print(f"Missing Keys  : {missing}")
        print(f"Patched Keys  : {patched}")
        print("Status        : PASS")
    except Exception as e:
        print(f"Status        : FAIL ({e})")
        sys.exit(1)

if __name__ == "__main__":
    main()
