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
// define port, start listen
const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port : " + port)
//
// EOF