const express = require('express')
const sqlite3 = require('sqlite3')
const path = require('path')
const bodyParser = require('body-parser');
const app = express()
const dbPath = "app/db/database.sqlite3"
//
// WebServerとしての設定を追加：
// リクエストのbodyをパースする設定
// （JSONデータのPOSTリクエスト等を処理するため）
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// publicディレクトリを静的ファイルのルートディレクトリとして設定
app.use(express.static(path.join(__dirname, 'public')));
//
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
//
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
//
// SQL runner for POST/PUT/DELETE Request
//
const run = async (sql, db) => {
  // const run = (sql, db) => {
  console.log('received request :' + sql)
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
  //
  console.log('done. and close db');
  db.close();
})
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
//
// define port, start listen
const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port : " + port)
//
// EOF