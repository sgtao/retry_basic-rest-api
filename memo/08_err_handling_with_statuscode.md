# 08_err_handling_with_statuscode

- 『ステータスコードを使った適切なエラーハンドリング』をやってみる
  - refer Utube : https://www.youtube.com/watch?v=faCCTvt1_Ic&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA&index=9
  - API の実行結果に応じてステータスコードを設定し、エラーハンドリングを行う

## REST サーバの変更点

### GET リクエスト（ユーザーリスト）

- ユーザーリスト取得リクエスト処理部の変更差分
  - SQL の取得情報がない場合、ステータス`400`を返す

```JavaScript
// Get users list
let apiPath = '/api/v1/users'
app.get(apiPath, (req, res) => {
  console.log("receive GET method at " + apiPath)
  const db = new sqlite3.Database(dbPath) // 接続
  // 下がDB処理
  db.all('SELECT * FROM users', (err, rows) => {
+    // Response with Error(Not Found)
+    if (!rows) {
+      res.status(404).send({ error: "Not Found!" })
+    } else {
+      res.status(200).json(rows)
+    }
+  });
  db.close() // 終了（必ず行う）
})
```

### GET リクエスト（ユーザー情報）

- 単一ユーザーの情報取得リクエスト処理部の変更差分
  - SQL の取得情報がない場合、ステータス`400`を返す

```JavaScript
// Get a user
apiPath = '/api/v1/users/:id' // `:id`の中には動的に値が入る
app.get(apiPath, (req, res) => {
  const id = req.params.id
  // console.log("receive request is ")
  // console.dir(req)
  console.log("receive GET method at " + apiPath + ' of ' + id)
  // Connect database
  const db = new sqlite3.Database(dbPath)
  //
  // DBをidで選択。
  // `...`(バッククォート)を使うことで、${...}の内部（${id})はJabaScriptの世界に戻る
  db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
+    if (!row) {
+      res.status(404).send({ error: "Not Found!" })
+    } else {
+      res.status(200).json(row)
+    }
  })
  db.close()
})
```

### GET リクエスト（ユーザー検索）

- ユーザー検索の処理部は、ヒット数０も想定内のため、例外応答しない（変更なし）

```JavaScript
// Search users with name matching keyword
apiPath = '/api/v1/search' //
app.get(apiPath, (req, res) => {
  const keyword = req.query.q;
  console.log("receive GET method at " + apiPath + ' with ' + keyword)
  // Connect database
  const db = new sqlite3.Database(dbPath)
  // sqliteのWHERE name LIKE ... で検索（今回は部分一致(%を前後においてるから)
  db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err, rows) => {
    res.json(rows)
  })
  db.close()
})
```

### POST リクエスト（ユーザー新規作成）

- ユーザ作成リクエスト処理の変更差分
  - リクエスト内容が想定外の時、ステータス 400 で応答（DB への書き込みしない）
  - DB アクセス操作で例外が起きた場合、ステータス 500 で応答する

```JavaScript
// Create a new user
app.post('/api/v1/users', async (req, res) => {
  console.log('receive POST request. write database...')
  // console.log(req)
+  //
+  // Error Check (name is exist?)
+  if (!req.body.name || req.body.name === "") {
+    let error_msg = "UserName is not Set!"
+    res.status(400).send({ error: error_msg })
+    console.log(error_msg)
+    return
+  }
  //
  // Connect database
  const db = new sqlite3.Database(dbPath)
  //
  const name = req.body.name
  const profile = req.body.profile ? req.body.profile : ""
  const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : ""
  //
+  try {
+    await run(
+      `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")`,
+      db
+    )
+    res.status(201).send({ message: "新規ユーザーを作成しました。" })
+  } catch (e) {
+    res.status(500).send({ error: e })
+  }
  console.log('done. and close db')
  db.close()
})
```

- DB アクセス部でエラーが起きたら、エラーを Express に返す
  - sqlite3 の実行結果をそのまま上位に返す

```JavaScript
// 呼び出し元の引数例：
  // Connect database
  const db = new sqlite3.Database(dbPath)
  sql = `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")`
//
// SQL runner for POST/PUT/DELETE Request
//
const run = async (sql, db) => {
  // const run = (sql, db) => {
  console.log('  => SQL request :' + sql)
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        return reject(err)
      } else {
        return resolve()
      }
    })
  })
}
```

### PUT リクエスト処理部（ユーザー情報更新）

- ユーザー情報の更新リクエスト処理の変更差分
  - リクエスト内容が想定外の時、ステータス 400 で応答（DB 操作はしない）
  - 更新ユーザーが見つからないとき、ステータス 404 で応答する（DB 操作はしない）
  - DB アクセス操作で例外が起きた場合、ステータス 500 で応答する

```JavaScript
// Update user's data
app.put('/api/v1/users/:id', async (req, res) => {
  console.log('receive PUT request. write database...')
  // console.log(req)
+  //
+  // Error Check (name is exist?)
+  if (!req.body.name || req.body.name === "") {
+    let error_msg = "UserName is not Set!"
+    res.status(400).send({ error: error_msg })
+    console.log(error_msg)
+    return
+  }
  // Connect database
  const db = new sqlite3.Database(dbPath)
  const id = req.params.id
  //
  // 現在のユーザの情報を取得する
  db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
+    if (!row) {
+      let error_msg = "Specify User not Found!"
+      res.status(404).send({ error: error_msg })
+      console.log(error_msg)
+      return
+    }
    const name = req.body.name ? req.body.name : row.name
    const profile = req.body.profile ? req.body.profile : row.profile
    const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth
    //
    // Update User info.
+    try {
+      await run(
+        `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id}`,
+        db
+      )
+      res.status(201).send({
+        message: "ユーザー情報を更新しました。"
+      })
+    } catch (e) {
+      res.status(500).send({ error: e })
+    }
  })
  //
  console.log('done. and close db')
  db.close()
})
```

### DELETE リクエスト処理部（ユーザー削除）

- ユーザー削除のリクエスト処理部の変更差分
  - 更新ユーザーが見つからないとき、ステータス 404 で応答する（DB 操作はしない）
  - DB アクセス操作で例外が起きた場合、ステータス 500 で応答する

```JavaScript
// Delete user's data
app.delete('/api/v1/users/:id', async (req, res) => {
  console.log('receive DELETE request. write database...')
  // console.log(req)
  //
  // Connect database
  const db = new sqlite3.Database(dbPath)
  const id = req.params.id
+  //
+  // ユーザ削除 with ErrorCheck
+  // 削除指示されたユーザがいない場合は終了する
+  db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
+    if (!row) {
+      let error_msg = "Specify User not Found!"
+      res.status(404).send({ error: error_msg })
+      console.log(error_msg)
+      return
+    }
+  })
  //
+  // エラーチェックがOKの場合、SQLの削除指示を実行
+  // ユーザ情報を削除する with Exception Handling
+  try {
+    await run(
+      `DELETE FROM users WHERE id=${id}`,
+      db
+    );
+    res.status(201).send({ message: "ユーザー情報を削除しました。" });
+  } catch (e) {
+    res.status(500).send({ error: e })
+  }
  //
  console.log('done. and close db')
  db.close()
})
```
