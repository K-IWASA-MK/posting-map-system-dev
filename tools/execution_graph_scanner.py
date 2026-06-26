import os
import re
import sys
import json
from datetime import datetime, timezone

def load_config(root_dir):
    config_path = os.path.join(root_dir, "tools", "config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("exclude_paths", [".git", ".github", "node_modules", "__pycache__"])
        except Exception as e:
            print(f"Warning: Failed to load config from {config_path}: {e}. Using defaults.", file=sys.stderr)
    return [".git", ".github", "node_modules", "__pycache__"]

def scan_js_files(root_dir, exclude_paths):
    js_files = []
    for root, dirs, files in os.walk(root_dir):
        # exclude_paths に基づき、ディレクトリをフィルタリング
        filtered_dirs = []
        for d in dirs:
            dir_full_path = os.path.join(root, d)
            dir_rel_path = os.path.relpath(dir_full_path, root_dir)
            dir_rel_path_normalized = dir_rel_path.replace(os.path.sep, "/")
            
            exclude = False
            for pattern in exclude_paths:
                if d == pattern:
                    exclude = True
                    break
                if dir_rel_path_normalized == pattern or dir_rel_path_normalized.startswith(pattern + "/"):
                    exclude = True
                    break
            if not exclude:
                filtered_dirs.append(d)
        dirs[:] = filtered_dirs
        
        for f in files:
            file_full_path = os.path.join(root, f)
            file_rel_path = os.path.relpath(file_full_path, root_dir)
            file_rel_path_normalized = file_rel_path.replace(os.path.sep, "/")
            
            # 除外チェック
            if any(file_rel_path_normalized == pattern or file_rel_path_normalized.startswith(pattern + "/") for pattern in exclude_paths):
                continue
                
            # *.js を対象とし、*.min.js などの圧縮ファイルは除外
            if f.endswith(".js") and not f.endswith(".min.js"):
                js_files.append((file_full_path, file_rel_path_normalized))
                
    return js_files

def clean_js_code(code):
    """
    JSコードからコメントと文字列リテラルを削除/置換し、静的解析のノイズを低減する。
    """
    pattern = re.compile(
        r'(?P<single_comment>//.*?$)|'
        r'(?P<multi_comment>/\*.*?\*/)|'
        r'(?P<double_string>"(?:\\.|[^"\\])*")|'
        r'(?P<single_string>\'(?:\\.|[^\'\\])*\')|'
        r'(?P<template_string>`(?:\\.|[^`\\])*`)',
        re.DOTALL | re.MULTILINE
    )
    
    def replacer(match):
        group = match.lastgroup
        if group in ('single_comment', 'multi_comment'):
            return ' '  # 改行維持のためスペース
        elif group in ('double_string', 'single_string', 'template_string'):
            return '""' # ダミーの空文字列
        return match.group(0)
        
    return pattern.sub(replacer, code)

def extract_body(code, start_idx):
    """
    指定されたインデックス以降で、波括弧 { } の対応をパースして関数本体を切り出す。
    波括弧がない（単一行アロー関数）場合は、行末またはセミコロンまでを切り出す。
    """
    brace_start = code.find('{', start_idx)
    
    # 単一行アロー関数の判定:
    # start_idx 以降、かつ最初に見つかる '{' よりも手前に '=>' が存在し、
    # かつその '=>' の直後に '{' が現れず、直接値や文が返されている場合。
    arrow_pos = code.find('=>', start_idx)
    if arrow_pos != -1 and (brace_start == -1 or arrow_pos < brace_start):
        # '=>' の後、最初に見つかる '{' までの領域を検証
        region_after_arrow = code[arrow_pos:brace_start] if brace_start != -1 else code[arrow_pos:]
        # '=>' の直後（改行やセミコロンの前の同一行内）に '{' が含まれていなければ、単一行アロー関数とみなす
        if '{' not in region_after_arrow.split('\n')[0] and '{' not in region_after_arrow.split(';')[0]:
            end_idx = code.find(';', start_idx)
            if end_idx == -1:
                end_idx = code.find('\n', start_idx)
            if end_idx == -1:
                end_idx = len(code)
            return code[start_idx:end_idx].strip()
            
    if brace_start == -1:
        # '{' が見つからない場合は、行末か ';' までを返す
        end_idx = code.find(';', start_idx)
        if end_idx == -1:
            end_idx = code.find('\n', start_idx)
        if end_idx == -1:
            end_idx = len(code)
        return code[start_idx:end_idx].strip()
        
    # 波括弧バランシング
    counter = 1
    idx = brace_start + 1
    while idx < len(code) and counter > 0:
        char = code[idx]
        if char == '{':
            counter += 1
        elif char == '}':
            counter -= 1
        idx += 1
        
    if counter == 0:
        return code[brace_start:idx].strip()
    return code[brace_start:].strip()

def extract_functions_from_code(cleaned_code, file_rel_path):
    """
    クリーン化済みのコードから関数定義を抽出する。
    """
    functions = {}
    
    # 厳格な関数定義パターン (1〜5)
    patterns = [
        # 1. Standard / Async Function: function name() or async function name()
        r'\b(?:async\s+)?function\s+(?P<name>[a-zA-Z0-9_$]+)\s*\(',
        # 2. Arrow Function (with parentheses): const name = (args) =>
        r'\b(?:const|let|var)\s+(?P<name>[a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>',
        # 3. Arrow Function (single arg): const name = arg =>
        r'\b(?:const|let|var)\s+(?P<name>[a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?[a-zA-Z0-9_$]+\s*=>',
        # 4. Function expression: const name = function()
        r'\b(?:const|let|var)\s+(?P<name>[a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?function\b',
        # 5. window property assignment: window.name = function() or window.name = () =>
        r'\bwindow\.(?P<name>[a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>)'
    ]
    
    # 6. Object Method (曖昧なパターン - 競合を防ぐため最後に処理)
    method_pattern = r'\b(?P<name>(?!if|for|while|catch|switch|function|async\b)[a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{'
    
    # 厳格なパターンを先に処理
    for pattern in patterns:
        for match in re.finditer(pattern, cleaned_code):
            func_name = match.group('name')
            start_idx = match.end()
            body = extract_body(cleaned_code, start_idx)
            
            functions[func_name] = {
                "file": file_rel_path,
                "body": body
            }
            
    # メソッドパターンを処理。既に登録されている関数名はスキップし、かつ直前に 'function' がないことを確認。
    for match in re.finditer(method_pattern, cleaned_code):
        func_name = match.group('name')
        if func_name in functions:
            continue
            
        # マッチの直前 15文字以内に 'function' というキーワードがある場合は、通常の関数宣言なのでスキップ
        match_start = match.start()
        prefix_region = cleaned_code[max(0, match_start-15):match_start]
        if re.search(r'\bfunction\s*$', prefix_region):
            continue
            
        start_idx = match.end()
        body = extract_body(cleaned_code, start_idx)
        
        functions[func_name] = {
            "file": file_rel_path,
            "body": body
        }
            
    return functions

def analyze_calls(all_functions):
    """
    全関数の本体をスキャンし、他の関数の呼び出し関係を抽出する。
    """
    graph = {}
    func_names = set(all_functions.keys())
    
    for func_name, info in all_functions.items():
        body = info["body"]
        calls = set()
        
        # 全ての関数名に対して、現在の関数本体に含まれているか確認
        for target_name in func_names:
            if func_name == target_name:
                continue # 自分自身への呼び出しは除外
                
            # 単語境界での出現を検知する
            pattern = r'\b' + re.escape(target_name) + r'\b'
            if re.search(pattern, body):
                calls.add(target_name)
                
        graph[func_name] = {
            "file": info["file"],
            "calls": sorted(list(calls))
        }
        
    return graph

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    
    exclude_paths = load_config(root_dir)
    js_files = scan_js_files(root_dir, exclude_paths)
    # 決定論的な順序にするため、相対パスでソート
    js_files.sort(key=lambda x: x[1])
    
    all_functions = {}
    
    # 全ての JS ファイルを読み込んで関数を抽出
    for filepath, rel_path in js_files:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
            continue
            
        cleaned = clean_js_code(content)
        file_funcs = extract_functions_from_code(cleaned, rel_path)
        all_functions.update(file_funcs)
        
    # コールグラフの解析
    graph = analyze_calls(all_functions)
    
    # 決定論的な結果にするため、キーをアルファベット順にソートした辞書を作成
    sorted_functions = {k: graph[k] for k in sorted(graph.keys())}
    
    if dry_run:
        print("Execution Graph\n")
        for func_name, info in sorted_functions.items():
            calls = info["calls"]
            if calls:
                print(func_name)
                for c in calls:
                    print("↓")
                    print(c)
                print()
    else:
        # メタデータの作成
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "execution_graph_scanner"
            },
            "functions": sorted_functions
        }
        
        output_path = os.path.join(script_dir, "execution_graph.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated execution graph: {output_path}")
        except Exception as e:
            print(f"Error writing execution graph: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
