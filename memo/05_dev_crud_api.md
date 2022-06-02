# 05_dev_crud_api

- 『CRUD な API を開発しよう』をやってみる
  - refer Utube : https://www.youtube.com/watch?v=GffwSIY_7xE&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA&index=6
  - POST、PUT、DELETE メソッドを追加する

## REST サーバへの追加

### 共通機能（SQL-DB への書き込み？機能）

```JavaScript
//
// SQL runner for POST/PUT/DELETE Request
//
const run = async (sql, db) => {
  // const run = (sql, db) => {
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

### 新規作成処理（POST リクエスト受信機能）

```JavaScript
//
// Create a new user
app.post('/api/v1/users', async (req, res) => {
  console.log('receive POST request. write database...');
  //
  // Connect database
  const db = new sqlite3.Database(dbPath);
  //
  const name = req.body.name;
  const profile = req.body.profile ? req.body.profile : "";
  const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : "";
  //
  try {
    await run(
      `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")`,
      db
    );
    res.status(202).send({ message: "新規ユーザーを作成しました。" });
  } catch (e) {
    res.status(500).send({ error: e });
  }
  console.log('done. and close db');
  db.close();
});
```

### ユーザ情報編集処理（PUT リクエスト受信機能）

```JavaScript
//
// Update user's data
app.put('/api/v1/users/:id', async (req, res) => {
  console.log('receive PUT request. write database...');
  // Connect database
  const db = new sqlite3.Database(dbPath);
  const id = req.params.id;
  //
  // 現在のユーザの情報を取得する
  db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
    if (!row) {
      let error_msg = "Specify User not Found!";
      res.status(404).send({ error: error_msg });
      console.log(error_msg);
      return;
    } else {
      const name = req.body.name ? req.body.name : row.name;
      const profile = req.body.profile ? req.body.profile : row.profile;
      const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth;
      //
      // Update User info.
      try {
        await run(
          `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id}`,
          db
        );
        res.status(201).send({
          message: "ユーザー情報を更新しました。"
        });
      } catch (e) {
        res.status(500).send({ error: e });
      }
    }
  })
  //
  console.log('done. and close db');
  db.close();
})
```

### ユーザ削除処理（DELETE リクエスト受信機能）

```JavaScript
//
// Delete user's data
app.delete('/api/v1/users/:id', async (req, res) => {
  console.log('receive DELETE request. write database...');
  //
  // Connect database
  const db = new sqlite3.Database(dbPath);
  const id = req.params.id;
  //
  // ユーザ削除 with ErrorCheck
  // 削除するユーザがいないことを確認して、DELETEを実行する
  db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
    if (!row) {
      let error_msg = "Specify User not Found!";
      res.status(404).send({ error: error_msg });
      console.log(error_msg);
      return;
    } else {
      // ユーザ情報を削除する with ErrorCheck
      try {
        await run(
          `DELETE FROM users WHERE id=${id}`,
          db
        );
        res.status(201).send({ message: "ユーザー情報を削除しました。" });
      } catch (e) {
        res.status(500).send({ error: e });
      }
    }
  });
  //
  console.log('done. and close db');
  db.close();
});
```
