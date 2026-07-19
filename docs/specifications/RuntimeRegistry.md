# Runtime Registry 仕様書

## 概要
本仕様書は、登録された Runtime の基本定義、および状態変更を追跡する Registry の内部構造を定義します。

## 管理対象メタデータ (Metadata Schema)
Registry が各 Runtime について永続的かつ動的に管理する項目は以下の通りです。

1. **RuntimeId (識別子)**:
   - システム内でユニークな一意識別名（例: `aios.validation`, `aios.console`）。
2. **RuntimeType (分類)**:
   - Runtime の役割に応じた分類（例: `validation`, `console`, `plugin`, `monitoring`, `quality`）。
3. **RuntimeVersion (バージョン)**:
   - SemVer 2.0.0 準拠のバージョン文字列（例: `1.0.0`）。
4. **RuntimeState (稼働状態)**:
   - 前述の `RuntimeState` ライフサイクルステート。
5. **RuntimeCapabilities (能力値)**:
   - Runtime が提供可能な機能（`CAN_TEST`, `VALIDATION`, `CONSOLE`, `PLUGIN` 等）。
6. **RuntimeDependencies (依存宣言)**:
   - 他の Runtime に対する依存情報。

---

## データモデル契約 (Type Definitions)
```typescript
export interface RegisteredRuntimeEntry {
  readonly runtimeId: string;
  readonly runtimeType: string;
  readonly runtimeVersion: string;
  readonly capabilities: RuntimeCapability[];
  readonly runtime: IRuntime;
  readonly stateMachine: RuntimeStateMachine;
  readonly dependsOn: string[];
}
```
