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
// define port, start listen
const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port : " + port)
//
// EOF