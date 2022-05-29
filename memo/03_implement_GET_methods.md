# 03_implement_GET_methods

- 『GET 用 API のハンズオン開発』をやってみる
  - refer Utube : https://www.youtube.com/watch?v=dURpu7Bjr_Y&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA&index=4
  - Ｇ ET メソッドの応答を実装する(ユーザリスト、ユーザ情報、検索)
    1. ユーザリスト取得：`curl -X GET http://localhost:3000/api/v1/users`
    2. ユーザ情報取得：`curl -X GET http://localhost:3000/api/v1/users/1`
    3. 検索：`curl -X GET http://localhost:3000/api/v1/search?q=subaru`
    - 実際は、postman を使ってテストする

## Node.js における、SQlite3 の操作例：

- パスの設定：変数に sqlite3 のファイルを設定しておく

```JavaScript
const dbPath = "app/db/database.sqlite3";
```

- 基本の形：処理をするたびに、接続 ⇒ 処理 ⇒ 終了を行う

```JavaScript
const db = new sqlite3.Database(dbPath); // 接続
db.all('SELECT * FROM users', (err, rows) => {
  // Response with Error(Not Found)
  if (!rows) {
    res.status(404).send({ error: "Not Found!" });
  } else {
    res.status(200).json(rows);
  }
}); // 処理
db.close(); // 終了（必ず行う）
```

- 処理の記述法（Node.js の場合）：

```JavaScript
db.serialize(() => { // queries }) // queriesを順番に実行し、１つずつ返す
db.all(sql, (err, rows)) // 全ての結果をを1度に取得
db.get(sql, (err, rows)) // １つだけ実行し、結果を取得
db.run(sql, (err, rows)) // SQLクエリを実行
```

## データの準備

- コマンドラインから DB を操作して今回利用するデータを準備する
- データの入力（SQL）

```SQL
INSERT INTO users (name, profile) VALUES ("Subaru", "エミリアたんマジ天使！");
INSERT INTO users (name, profile) VALUES ("Emilia", "もう、スバルのオタンコナス！");
INSERT INTO users (name, profile) VALUES ("Ram", "いいえお客様、きっと生まれて来たのが間違いだわ");
INSERT INTO users (name, profile) VALUES ("Rem", "はい、スバルくんのレムです。");
INSERT INTO users (name, profile) VALUES ("Roswaal", "君は私になーぁにを望むのかな？");
```

- データの確認（SQL）

```SQL
SELECT * FROM users;
-- 表示されない場合は';'を入れて、ENTER
```

- 記録：

```SQL
$ sqlite3 app/db/database.sqlite3
SQLite version 3.27.2 2019-02-25 16:06:06
Enter ".help" for usage hints.
sqlite> .tables
users
sqlite>
sqlite> SELECT * FROM users;
sqlite> INSERT INTO users (name, profile) VALUES ("Subaru", "エミリアたんマジ天 使！");
sqlite> INSERT INTO users (name, profile) VALUES ("Emilia", "もう、スバルのオタ ンコナス！");
sqlite> INSERT INTO users (name, profile) VALUES ("Ram", "いいえお客様、きっと生まれて来たのが間違いだわ");
INSERT INTO users (name, profile) VALUES ("Rem", "はい、スバルくんのレムです。");
sqlite> INSERT INTO users (name, profile) VALUES ("Rem", "はい、スバルくんのレムです。");
INSERT INTO users (name, profile) VALUES ("Roswaal", "君は私になーぁにを望むのかな？");sqlite> INSERT INTO users (name, profile) VALUES ("Roswaal", "君は私にな 望むのかな？");
sqlite> SELECT * FROM users;
1|Subaru|エミリアたんマジ天使！|2022-05-29 17:42:33|2022-05-29 17:42:33|
2|Emilia|もう、スバルのオタンコナス！|2022-05-29 17:42:33|2022-05-29 17:42:33|
3|Ram|いいえお客様、きっと生まれて来たのが間違いだわ|2022-05-29 17:42:33|2022-05-29 17:42:33|
4|Rem|はい、スバルくんのレムです。|2022-05-29 17:42:33|2022-05-29 17:42:33|
5|Roswaal|君は私になーぁにを望むのかな？|2022-05-29 17:42:34|2022-05-29 17:42:34|
sqlite>
sqlite> -- [Ctrl+D]で終了
sqlite>
shogo@raspberrypi4:$
```

## REST サーバの実装：

### １．ユーザリストの取得：

```JavaScript
const express = require('express')
const sqlite3 = require('sqlite3')
const app = express()
const dbPath = "app/db/database.sqlite3"
//
// Get users list
let apiPath = '/api/v1/users'
app.get(apiPath, (req, res) => {
  console.log("receive GET method at " + apiPath)
  const db = new sqlite3.Database(dbPath) // 接続
  // 下がDB処理
  db.all('SELECT * FROM users', (err, rows) => {
    res.status(200).json(rows);
  }) // 処理
  db.close() // 終了（必ず行う）
})
//
// define port, start listen
const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port : " + port)
//
// EOF
```

- 実行例（サーバ側）：

```shell
shogo@raspberrypi4:$ npm run start
#
# > trace-basic-rest-api@1.0.0 start
# > node-dev app/app.js
#
# Listen on port : 3000
# receive GET method at /api/v1/users
# [Ctrl+C] で終了
# ^C
```

- 実行例（クライアント側）：

```JSON
@raspberrypi4:$ curl -X GET http://localhost:3000/api/v1/users/ | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   872  100   872    0     0  36333      0 --:--:-- --:--:-- --:--:-- 36333
[
  {
    "id": 1,
    "name": "Subaru",
    "profile": "エミリアたんマジ天使！",
    "created_at": "2022-05-29 17:42:33",
    "updated_at": "2022-05-29 17:42:33",
    "date_of_birth": null
  },
  {
    "id": 2,
    "name": "Emilia",
    "profile": "もう、スバルのオタンコナス！",
    "created_at": "2022-05-29 17:42:33",
    "updated_at": "2022-05-29 17:42:33",
    "date_of_birth": null
  },
  {
    "id": 3,
    "name": "Ram",
    "profile": "いいえお客様、きっと生まれて来たのが間違いだわ",
    "created_at": "2022-05-29 17:42:33",
    "updated_at": "2022-05-29 17:42:33",
    "date_of_birth": null
  },
  {
    "id": 4,
    "name": "Rem",
    "profile": "はい、スバルくんのレムです。",
    "created_at": "2022-05-29 17:42:33",
    "updated_at": "2022-05-29 17:42:33",
    "date_of_birth": null
  },
  {
    "id": 5,
    "name": "Roswaal",
    "profile": "君は私になーぁにを望むのかな？",
    "created_at": "2022-05-29 17:42:34",
    "updated_at": "2022-05-29 17:42:34",
    "date_of_birth": null
  }
]
shogo@raspberrypi4:$
```

### ２．ユーザー情報の取得

- ソース変更（追加）

```JavaScript
//
// Get a user
apiPath = '/api/v1/users/:id' // `:id`の中には動的に値が入る
app.get(apiPath, (req, res) => {
  const id = req.params.id;
  // console.log("receive request is ")
  // console.dir(req)
  console.log("receive GET method at " + apiPath + ' of ' + id)
  // Connect database
  const db = new sqlite3.Database(dbPath);
  //
  // DBをidで選択。
  // `...`(バッククォート)を使うことで、${...}の内部（${id})はJabaScriptの世界に
  db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
    res.status(200).json(row)
  })
  db.close();
});
```

- 実行ログ（クライアント側）：

```JSON
shogo@raspberrypi4:$ curl -X GET http://localhost:3000/api/v1/users/3 | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   194  100   194    0     0   7760      0 --:--:-- --:--:-- --:--:--  8083
{
  "id": 3,
  "name": "Ram",
  "profile": "いいえお客様、きっと生まれて来たのが間違いだわ",
  "created_at": "2022-05-29 17:42:33",
  "updated_at": "2022-05-29 17:42:33",
  "date_of_birth": null
}
shogo@raspberrypi4:$
```


### ３．ユーザ名の検索
- ソース変更（追加）

```JavaScript
// Search users with name matching keyword
apiPath = '/api/v1/search' // 
app.get(apiPath, (req, res) => {
  const keyword = req.query.q;
  console.log("receive GET method at " + apiPath + ' with ' + keyword)
  // Connect database
  const db = new sqlite3.Database(dbPath);
  // sqliteのWHERE name LIKE ... で検索（今回は部分一致(%を前後においてるから)
  db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err, rows) => {
    res.json(rows)
  });
  db.close();
});
```

- 実行結果（クライアント側）
```JSON
shogo@raspberrypi4:$ curl -X GET http://localhost:3000/api/v1/search?q=rem | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   169  100   169    0     0   5827      0 --:--:-- --:--:-- --:--:--  6035
[
  {
    "id": 4,
    "name": "Rem",
    "profile": "はい、スバルくんのレムです。",
    "created_at": "2022-05-29 17:42:33",
    "updated_at": "2022-05-29 17:42:33",
    "date_of_birth": null
  }
]
shogo@raspberrypi4:$
```