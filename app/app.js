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
// append setting for CORS
// refer MDN : https://developer.mozilla.org/ja/docs/Web/HTTP/CORS
// refer Qiita : https://qiita.com/chenglin/items/5e563e50d1c32dadf4c3
const cors = require('cors')
// let allow_origin = ['http://localhost', 'http://192.168.10.9',]
let allow_origin = '*'
const corsOptions = {
  origin: allow_origin,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
//
// for GET Request
//
// Get users list
let apiPath = '/api/v1/users'
app.get(apiPath, (req, res) => {
  console.log("receive GET method at " + apiPath)
  // console.dir(req)
  //
  // Connect database
  const db = new sqlite3.Database(dbPath) // 接続
  // 下がDB処理
  db.all('SELECT * FROM users', (err, rows) => {
    // Response with Error(Not Found)
    if (!rows) {
      res.status(404).send({ error: "Not Found!" })
    } else {
      res.status(200).json(rows)
    }
  });
  db.close() // 終了（必ず行う）
})
//
// Get a user 
apiPath = '/api/v1/users/:id' // `:id`の中には動的に値が入る
app.get(apiPath, (req, res) => {
  const id = req.params.id
  // console.log("receive request is ")
  console.log("receive GET method at " + apiPath + ' of ' + id)
  // console.dir(req)
  //
  // Connect database
  const db = new sqlite3.Database(dbPath)
  //
  // DBをidで選択。
  // `...`(バッククォート)を使うことで、${...}の内部（${id})はJabaScriptの世界に戻る
  db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
    if (!row) {
      res.status(404).send({ error: "Not Found!" })
    } else {
      res.status(200).json(row)
    }
  })
  db.close()
})
//
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
//
// Create a new user
app.post('/api/v1/users', async (req, res) => {
  console.log('receive POST request. write database...')
  // console.log(req)
  //
  // Error Check (name is exist?)
  if (!req.body.name || req.body.name === "") {
    let error_msg = "UserName is not Set!"
    res.status(400).send({ error: error_msg })
    console.log(error_msg)
    return
  }
  //
  // Connect database
  const db = new sqlite3.Database(dbPath)
  //
  const name = req.body.name
  const profile = req.body.profile ? req.body.profile : ""
  const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : ""
  //
  try {
    await run(
      `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")`,
      db
    )
    res.status(201).send({ message: "新規ユーザーを作成しました。" })
  } catch (e) {
    res.status(500).send({ error: e })
  }
  console.log('done. and close db')
  db.close()
})
//
// Update user's data
app.put('/api/v1/users/:id', async (req, res) => {
  console.log('receive PUT request. write database...')
  // console.log(req)
  //
  // Error Check (name is exist?)
  if (!req.body.name || req.body.name === "") {
    let error_msg = "UserName is not Set!"
    res.status(400).send({ error: error_msg })
    console.log(error_msg)
    return
  }
  // Connect database
  const db = new sqlite3.Database(dbPath)
  const id = req.params.id
  //
  // 現在のユーザの情報を取得する
  db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
    if (!row) {
      let error_msg = "Specify User not Found!"
      res.status(404).send({ error: error_msg })
      console.log(error_msg)
      return
    }     
    const name = req.body.name ? req.body.name : row.name
    const profile = req.body.profile ? req.body.profile : row.profile
    const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth
    //
    // Update User info.
    try {
      await run(
        `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id}`,
        db
      )
      res.status(201).send({
        message: "ユーザー情報を更新しました。"
      })
    } catch (e) {
      res.status(500).send({ error: e })
    }
  })
  //
  console.log('done. and close db')
  db.close()
})
//
// Delete user's data
app.delete('/api/v1/users/:id', async (req, res) => {
  console.log('receive DELETE request. write database...')
  // console.log(req)
  //
  // Connect database
  const db = new sqlite3.Database(dbPath)
  const id = req.params.id
  //
  // ユーザ削除 with ErrorCheck
  // 削除指示されたユーザがいない場合は終了する
  db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
    if (!row) {
      let error_msg = "Specify User not Found!"
      res.status(404).send({ error: error_msg })
      console.log(error_msg)
      return
    }
  })
  //
  // エラーチェックがOKの場合、SQLの削除指示を実行
  // ユーザ情報を削除する with Exception Handling
  try {
    await run(
      `DELETE FROM users WHERE id=${id}`,
      db
    );
    res.status(201).send({ message: "ユーザー情報を削除しました。" });
  } catch (e) {
    res.status(500).send({ error: e })
  }
  //
  console.log('done. and close db')
  db.close()
})
//
// define port, start listen
const port = process.env.PORT || 3000
app.listen(port)
console.log("Listen on port : " + port)
//
// EOF