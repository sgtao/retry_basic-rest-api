# 02_design_resource+database

- 『リソース設計と DB 設計』をやってみる
  - refer Utube : https://www.youtube.com/watch?v=x4ZrmnqoS1Y&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA&index=3
  - 最も時間をかけるのが設計部分
    - SNS サービスの一部リソースを例に設計ステップを学ぶ
    - 『リソース指向アーキテクチャ』に則った設計を紹介

## 『リソース指向アーキテクチャ(ROA)』の設計手順

- refer Qiita : https://qiita.com/_kurihara/items/15056abd8a7c03cbbc6d
- ステップに沿って、設計を進める
  1. 提供するデータの特定
  2. データをリソースに分ける（リソース設計）
  3. リソースに URI をつける（URI 設計）
  4. クライアントに提供するリソース表現を選択（HTML,　 JSON など）
  5. リンクとフォームを利用してリソース同士を結びつける
  6. イベントの標準的なコースを検討する
  7. エラーについて検討

## 1. 提供するデータの特定、2. リソース設計

- SNS のデータ特定
  - ユーザー情報：ユーザ ID、ユーザ名、プロフィール、誕生日...など
  - フォロー情報：フォロワー ID、フォロー ID
- まずユーザーリソースを設計・実現する

## 3. URI 設計

- URI を 2 つ設ける
  1. `/users/` : ユーザーリソースの URI
  2. `/search?q=` ：検索結果リソースの URI（`?q`はクエリパラメータ）
  - ベースの URI として、`/api/vi/`をつける。
    - ⇒ 　例）`localhost:3000/api/v1/users` などなる

| メソッド | URI                        | 詳細                   |
| -------- | -------------------------- | ---------------------- |
| GET      | /api/v1/users              | ユーザリストの取得     |
| GET      | /api/v1/users/123          | ユーザ情報の取得       |
| POST     | /api/v1/users              | 新規ユーザの作成       |
| PUT      | /api/v1/users/123          | ユーザ情報の更新       |
| DELETE   | /api/v1/users/123          | ユーザの削除           |
| GET      | /api/v1/search?q={keyword} | ユーザー検索結果の取得 |
| ----     | ----                       | ----                   |

## 3. データベース設計

- まず、ユーザ情報のデータベースを作成

  - `id`をつける（必須）。
  - `created_at`と`updated_at`を付けたほうが管理がしやすくなる

- `Users`テーブル　は次のようになる
  - `id`(PRIMARY_KEY)は、DB を操作するときに、データを指定する情報で使用する

| フィールド名  | データ型 | NULL 許容       | その他・補足         |
| ------------- | -------- | --------------- | -------------------- |
| id            | INT.     | NOT NULL(=必須) | PRIMARY_KEY          |
| name          | TEXT     | NOT NULL        |                      |
| profiel       | TEXT     |                 |                      |
| date_of_birth | TEXT     |                 |                      |
| created_ad    | TEXT     | NOT NULL        | `datetime`関数で取得 |
| updated_at    | TEXT     | NOT NULL        | `datetime`関数で取得 |
| ----          | ----     | ----            | ----                 |

- DB 作成（SQLite3 のコマンド）：

```SQL
CREATE TABLE users (
  id INTEGER NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  profile TEXT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  date_of_birth TEXT
);
```

- `.schema`を実行すると、テーブルの構造が表示される野で、確認に利用

- 記録：

```shell
shogo@raspberrypi4:$ mkdir app/db
shogo@raspberrypi4:$ sqlite3 app/db/database.sqlite3
SQLite version 3.27.2 2019-02-25 16:06:06
Enter ".help" for usage hints.
sqlite> CREATE TABLE users (
   ...>   id INTEGER NOT NULL PRIMARY KEY,
   ...>   name TEXT NOT NULL,
   ...>   profile TEXT,
   ...>   created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
   ...>   updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
   ...>   date_of_birth TEXT
   ...> );
sqlite> .tables
users
sqlite> .schema; -- 構造の表示
CREATE TABLE users (
  id INTEGER NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  profile TEXT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  date_of_birth TEXT
);
sqlite> INSERT INTO users (name, profile) VALUES ("foo", "bar");
sqlite> SELECT * from users
   ...> ;
1|foo|bar|2022-05-29 17:04:19|2022-05-29 17:04:19|
sqlite> DELETE FROM users WHERE name = "foo";
sqlite> SELECT * from users
   ...> ;
sqlite>
sqlite>
sqlite> -- [Ctrl+D]で終了
shogo@raspberrypi4:$
```

- `sqlite3`は、`npm run`でも実行できる

```shell
npm run connect
# > trace-basic-rest-api@1.0.0 connect
# > sqlite3 app/db/database.sqlite3
#
# SQLite version 3.27.2 2019-02-25 16:06:06
# Enter ".help" for usage hints.
## sqlite> -- [Ctrl+D] で終了
# shogo@raspberrypi4:$
```
