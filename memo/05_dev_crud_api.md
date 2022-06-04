# 05_dev_crud_api

- 『CRUD な API を開発しよう』をやってみる
  - refer Utube : https://www.youtube.com/watch?v=GffwSIY_7xE&list=PLX8Rsrpnn3IVW5P1H1s_AOP0EEyMyiRDA&index=6
  - POST、PUT、DELETE メソッドを追加する

## REST サーバへの追加

### リクエストの body を読み取る設定

- 書き込みリクエストには body（データ）がついてくる
  - 通常では body を処理できないので、`bodyParser.urlencoded`を組み込む
    - オプションで、`{extended: true}`をつける
  - 追加で JSON データを扱えるように`json`メソッドも組み込む

```JavaScript
// リクエストのbodyをパースする設定
// （JSONデータのPOSTリクエスト等を処理するため）
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
```

### 書き込み用の共通機能（SQL-DB への書き込み機能）

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

- 現状、本プログラムで予定している SQL 構文は次の３つ
  1. 作成：

```SQL
INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")
```

2. 更新：

```SQL
UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id}
```

3. 削除：

```SQL
DELETE FROM users WHERE id=${id}
```

### 新規作成処理（POST リクエスト受信機能）

- POST リクエストで新たにユーザーを作成する
  - リクエストを受けたら、`name`、`profile`、`dateOfBirth`のデータセットを SQL 構文で書き込む
    - 任意のデータは含まれてない事があるので、リクエストボディーを検査する
  - いったん、エラー処理を付けない形で実装する

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
  await run(
    `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")`,
    db
  );
  res.status(201).send({ message: "新規ユーザーを作成しました。" });
  console.log('done. and close db');
  db.close();
});
```

### ユーザ情報編集処理（PUT リクエスト受信機能）

- PUT リクエストで既存のユーザーに関する情報を編集する
  - 編集する前に、対象のユーザー情報を取得する
  - 取得したデータとリクエストボディをもとに SQL の UPDATE 指示を実行する

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
    const name = req.body.name ? req.body.name : row.name;
    const profile = req.body.profile ? req.body.profile : row.profile;
    const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth;
    //
    // Update User info.
    await run(
      `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id}`,
      db
    );
    res.status(201).send({ message: "ユーザー情報を更新しました。" });
  })
```

### ユーザ削除処理（DELETE リクエスト受信機能）

- DELETE リクエストで指定 ID のユーザーを削除する
  - 指定された ID に対して、SQL の DELETE を指示する

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
  // ユーザ削除 without ErrorCheck
  // 無条件にユーザを削除する
  await run(
    `DELETE FROM users WHERE id=${id}`,
    db
  );
  res.status(201).send({ message: "ユーザー情報を削除しました。" });
  //
  console.log('done. and close db');
  db.close();
});
```
