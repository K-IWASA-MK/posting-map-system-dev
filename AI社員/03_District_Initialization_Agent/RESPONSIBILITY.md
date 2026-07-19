# Responsibility Boundary

## Input

受信:

- districtName
- electionId
- requester
- requestId


## Process

実行:

District Initialization Workflow


## Output

生成:

- initializationId
- district情報
- municipality一覧
- area生成状態
- dashboard生成状態
- visualization生成状態


## Responsibility Map

|項目|担当|
|-|-|
|地区確認|YES|
|自治体取得|YES|
|Area生成依頼|YES|
|投票率取得|連携|
|地図生成|連携|
|配布管理|NO|
|GPS管理|NO|
